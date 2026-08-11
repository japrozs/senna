import { OAuthAccount } from "../entities/oauth-account";
import { Document } from "../entities/document";
import { Provider } from "../types";

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
