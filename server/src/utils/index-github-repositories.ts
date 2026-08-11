import { OAuthAccount } from "../entities/oauth-account";
import { Document } from "../entities/document";
import { Provider } from "../types";

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
