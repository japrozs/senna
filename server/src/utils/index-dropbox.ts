import { OAuthAccount } from "../entities/oauth-account";
import { Document } from "../entities/document";
import { Provider } from "../types";
import { Request, Response } from "express";

interface DropboxEntry {
	".tag": string;
	id: string;
	name: string;
	path_display?: string;
	server_modified?: string;
}

interface DropboxListFolderResponse {
	entries: DropboxEntry[];
	cursor: string;
	has_more: boolean;
}

export async function indexDropbox(userId: string) {
	const account = await OAuthAccount.findOne({
		where: {
			userId,
			provider: Provider.DROPBOX,
		},
	});

	if (!account) {
		throw new Error("Dropbox account not connected");
	}

	const response = await fetch(
		"https://api.dropboxapi.com/2/files/list_folder",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${account.accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				path: "",
				recursive: true,
				include_deleted: false,
			}),
		},
	);

	if (!response.ok) {
		throw new Error(
			`Dropbox API request failed: ${response.status} ${await response.text()}`,
		);
	}

	let data: DropboxListFolderResponse = await response.json();

	await processDropboxEntries(userId, data.entries);

	while (data.has_more) {
		const continueResponse = await fetch(
			"https://api.dropboxapi.com/2/files/list_folder/continue",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${account.accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					cursor: data.cursor,
				}),
			},
		);

		if (!continueResponse.ok) {
			throw new Error(
				`Dropbox pagination failed: ${continueResponse.status} ${await continueResponse.text()}`,
			);
		}

		data = await continueResponse.json();

		await processDropboxEntries(userId, data.entries);
	}

	console.log(`Dropbox indexing completed for user ${userId}`);
}

async function processDropboxEntries(userId: string, entries: DropboxEntry[]) {
	for (const entry of entries) {
		/*
		 * Only index files.
		 * Ignore Dropbox folders.
		 */
		if (entry[".tag"] !== "file") {
			continue;
		}

		if (!entry.id || !entry.name) {
			continue;
		}

		let document = await Document.findOne({
			where: {
				userId,
				provider: Provider.DROPBOX,
				externalId: entry.id,
			},
		});

		if (!document) {
			document = Document.create({
				userId,
				provider: Provider.DROPBOX,
				externalId: entry.id,
				title: entry.name,
				url: "",
				mimeType: "dropbox/file",
				modifiedAt: new Date(entry.server_modified ?? Date.now()),
			});
		} else {
			document.title = entry.name;
			document.mimeType = "dropbox/file";
			document.modifiedAt = new Date(entry.server_modified ?? Date.now());
		}

		await document.save();

		console.log(`Indexed Dropbox file "${entry.name}"`);
	}
}

export const dropboxOAuthCallback = async (req: Request, res: Response) => {
	try {
		const { code, state } = req.query;

		if (!code || typeof code !== "string") {
			return res.status(400).send("Missing authorization code");
		}

		if (
			!state ||
			typeof state !== "string" ||
			state !== req.session.dropboxOAuthState
		) {
			return res.status(400).send("Invalid OAuth state");
		}

		delete req.session.dropboxOAuthState;

		const tokenResponse = await fetch(
			"https://api.dropboxapi.com/oauth2/token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					code,
					grant_type: "authorization_code",
					client_id: process.env.DROPBOX_CLIENT_ID!,
					client_secret: process.env.DROPBOX_CLIENT_SECRET!,
					redirect_uri: process.env.DROPBOX_REDIRECT_URI!,
				}).toString(),
			},
		);

		const tokenData = await tokenResponse.json();

		if (!tokenResponse.ok || !tokenData.access_token) {
			console.error("Dropbox token error:", tokenData);

			return res
				.status(400)
				.send("Dropbox did not return an access token");
		}

		const userId = req.session.userId!;

		let account = await OAuthAccount.findOne({
			where: {
				userId,
				provider: Provider.DROPBOX,
			},
		});

		if (!account) {
			account = OAuthAccount.create({
				userId,
				provider: Provider.DROPBOX,
				providerAccountId: tokenData.account_id ?? null,
				accessToken: tokenData.access_token,
				refreshToken: tokenData.refresh_token ?? null,
				expiresAt: tokenData.expires_in
					? new Date(Date.now() + tokenData.expires_in * 1000)
					: null,
			});
		} else {
			account.accessToken = tokenData.access_token;

			if (tokenData.refresh_token) {
				account.refreshToken = tokenData.refresh_token;
			}

			if (tokenData.account_id) {
				account.providerAccountId = tokenData.account_id;
			}

			account.expiresAt = tokenData.expires_in
				? new Date(Date.now() + tokenData.expires_in * 1000)
				: account.expiresAt;
		}

		await account.save();

		/*
		 * Start indexing in the background.
		 * Don't make the user wait for Dropbox indexing.
		 */
		indexDropbox(userId)
			.then(() => {
				console.log(`Dropbox indexing completed for user ${userId}`);
			})
			.catch((error) => {
				console.error(
					`Dropbox indexing failed for user ${userId}:`,
					error,
				);
			});

		return res.redirect(
			`${process.env.CORS_ORIGIN}/settings?dropbox=connected`,
		);
	} catch (error) {
		console.error("Dropbox OAuth error:", error);

		return res.status(500).send("Failed to connect Dropbox account");
	}
};
