import { OAuthAccount } from "../entities/oauth-account";
import { Document } from "../entities/document";
import { Provider } from "../types";
import { Request, Response } from "express";

export async function indexGitHubRepositories(userId: string) {
	const account = await OAuthAccount.findOne({
		where: {
			userId,
			provider: Provider.GITHUB,
		},
	});

	if (!account) {
		throw new Error("GitHub account not connected");
	}

	let page = 1;

	while (true) {
		const response = await fetch(
			`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,
			{
				headers: {
					Authorization: `Bearer ${account.accessToken}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			},
		);

		if (!response.ok) {
			throw new Error(
				`GitHub API request failed: ${response.status} ${await response.text()}`,
			);
		}

		const repositories = await response.json();

		if (!repositories.length) {
			break;
		}

		for (const repo of repositories) {
			if (!repo.id || !repo.name) {
				continue;
			}

			let document = await Document.findOne({
				where: {
					userId,
					provider: Provider.GITHUB,
					externalId: String(repo.id),
				},
			});

			if (!document) {
				document = Document.create({
					userId,
					provider: Provider.GITHUB,
					externalId: String(repo.id),
					title: repo.name,
					url: repo.html_url ?? "",
					mimeType: "github/repository",
					modifiedAt: new Date(repo.updated_at ?? Date.now()),
				});
			} else {
				document.title = repo.name;
				document.url = repo.html_url ?? "";
				document.mimeType = "github/repository";
				document.modifiedAt = new Date(repo.updated_at ?? Date.now());
			}

			await document.save();

			console.log(`Indexed GitHub repository "${repo.name}"`);
		}

		page++;
	}

	console.log(`GitHub repository indexing completed for user ${userId}`);
}

export const githubOAuthCallback = async (req: Request, res: Response) => {
	try {
		const { code, state } = req.query;

		if (!code || typeof code !== "string") {
			return res.status(400).send("Missing authorization code");
		}

		if (
			!state ||
			typeof state !== "string" ||
			state !== req.session.githubOAuthState
		) {
			return res.status(400).send("Invalid OAuth state");
		}

		delete req.session.githubOAuthState;

		const tokenResponse = await fetch(
			"https://github.com/login/oauth/access_token",
			{
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					client_id: process.env.GITHUB_CLIENT_ID,
					client_secret: process.env.GITHUB_CLIENT_SECRET,
					code,
					redirect_uri: process.env.GITHUB_REDIRECT_URI,
				}),
			},
		);

		const tokenData = await tokenResponse.json();

		if (!tokenData.access_token) {
			console.error("GitHub token error:", tokenData);

			return res
				.status(400)
				.send("GitHub did not return an access token");
		}

		const userId = req.session.userId!;

		let account = await OAuthAccount.findOne({
			where: {
				userId,
				provider: Provider.GITHUB,
			},
		});

		if (!account) {
			account = OAuthAccount.create({
				userId,
				provider: Provider.GITHUB,
				providerAccountId: null,
				accessToken: tokenData.access_token,
				refreshToken: null,
				expiresAt: null,
			});
		} else {
			account.accessToken = tokenData.access_token;
		}

		await account.save();

		await indexGitHubRepositories(userId);

		return res.redirect(
			`${process.env.CORS_ORIGIN}/settings?github=connected`,
		);
	} catch (error) {
		console.error("GitHub OAuth error:", error);

		return res.status(500).send("Failed to connect GitHub account");
	}
};
