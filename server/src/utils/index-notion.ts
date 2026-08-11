import { Request, Response } from "express";
import { OAuthAccount } from "../entities/oauth-account";
import { Document } from "../entities/document";
import { Provider } from "../types";

export async function indexNotion(userId: string) {
	const account = await OAuthAccount.findOne({
		where: {
			userId,
			provider: Provider.NOTION,
		},
	});

	if (!account) {
		throw new Error("Notion account not connected");
	}

	let startCursor: string | undefined = undefined;

	while (true) {
		const response = await fetch("https://api.notion.com/v1/search", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${account.accessToken}`,
				"Notion-Version": "2022-06-28",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				page_size: 100,
				start_cursor: startCursor,
				filter: {
					property: "object",
					value: "page",
				},
			}),
		});

		if (!response.ok) {
			throw new Error(
				`Notion API request failed: ${response.status} ${await response.text()}`,
			);
		}

		const data: any = await response.json();

		for (const page of data.results) {
			if (!page.id) {
				continue;
			}

			/*
			 * Notion page titles are stored inside the
			 * page's title property.
			 */
			let title = "Untitled";

			const properties = page.properties ?? {};

			for (const property of Object.values(properties) as any[]) {
				if (
					property.type === "title" &&
					Array.isArray(property.title)
				) {
					const titleText = property.title
						.map((item: any) => item.plain_text ?? "")
						.join("");

					if (titleText.trim()) {
						title = titleText;
					}

					break;
				}
			}

			/*
			 * Notion's last_edited_time is an ISO timestamp.
			 *
			 * Fall back to created_time and finally Date.now()
			 * so modifiedAt is never null.
			 */
			const modifiedAt = new Date(
				page.last_edited_time ?? page.created_time ?? Date.now(),
			);

			let document = await Document.findOne({
				where: {
					userId,
					provider: Provider.NOTION,
					externalId: page.id,
				},
			});

			if (!document) {
				document = Document.create({
					userId,
					provider: Provider.NOTION,
					externalId: page.id,
					title,
					url:
						page.url ??
						`https://www.notion.so/${page.id.replace(/-/g, "")}`,
					mimeType: "notion/page",
					modifiedAt,
				});
			} else {
				document.title = title;
				document.url =
					page.url ??
					`https://www.notion.so/${page.id.replace(/-/g, "")}`;
				document.mimeType = "notion/page";
				document.modifiedAt = modifiedAt;
			}

			await document.save();

			console.log(`Indexed Notion page "${title}"`);
		}

		if (!data.has_more) {
			break;
		}

		startCursor = data.next_cursor;
	}

	console.log(`Notion indexing completed for user ${userId}`);
}

export const notionOAuthCallback = async (req: Request, res: Response) => {
	try {
		const { code, state } = req.query;

		if (!code || typeof code !== "string") {
			return res.status(400).send("Missing authorization code");
		}

		if (
			!state ||
			typeof state !== "string" ||
			state !== req.session.notionOAuthState
		) {
			return res.status(400).send("Invalid OAuth state");
		}

		// OAuth state has been successfully validated.
		delete req.session.notionOAuthState;

		const response = await fetch("https://api.notion.com/v1/oauth/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${Buffer.from(
					`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`,
				).toString("base64")}`,
			},
			body: JSON.stringify({
				grant_type: "authorization_code",
				code,
				redirect_uri: process.env.NOTION_REDIRECT_URI,
			}),
		});

		if (!response.ok) {
			const error = await response.text();

			console.error("Notion token exchange failed:", error);

			return res.status(400).send("Failed to connect Notion account");
		}

		const tokens = await response.json();

		if (!tokens.access_token) {
			return res
				.status(400)
				.send("Notion did not return an access token");
		}

		const userId = req.session.userId!;

		let account = await OAuthAccount.findOne({
			where: {
				userId,
				provider: Provider.NOTION,
			},
		});

		if (!account) {
			account = OAuthAccount.create({
				userId,
				provider: Provider.NOTION,
				providerAccountId: tokens.bot_id ?? null,
				accessToken: tokens.access_token,
				refreshToken: null,
				expiresAt: null,
			});
		} else {
			account.accessToken = tokens.access_token;

			if (tokens.bot_id) {
				account.providerAccountId = tokens.bot_id;
			}
		}

		await account.save();

		/*
		 * Index the user's Notion pages.
		 */
		indexNotion(userId)
			.then(() => {
				console.log(`Notion indexing completed for user ${userId}`);
			})
			.catch((error) => {
				console.error(
					`Notion indexing failed for user ${userId}:`,
					error,
				);
			});

		return res.redirect(
			`${process.env.CORS_ORIGIN}/settings?notion=connected`,
		);
	} catch (error) {
		console.error("Notion OAuth error:", error);

		return res.status(500).send("Failed to connect Notion account");
	}
};
