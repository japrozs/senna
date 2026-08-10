import { google } from "googleapis";
import { OAuthAccount } from "../entities/oauth-account";
import { Document, Provider } from "../entities/document";

export async function indexGoogleDrive(userId: string) {
	const account = await OAuthAccount.findOne({
		where: {
			userId,
			provider: "google",
		},
	});

	if (!account) {
		throw new Error("Google account is not connected");
	}

	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URI,
	);

	oauth2Client.setCredentials({
		access_token: account.accessToken,
		refresh_token: account.refreshToken ?? undefined,
	});

	const drive = google.drive({
		version: "v3",
		auth: oauth2Client,
	});

	let pageToken: string | undefined;

	do {
		const response = await drive.files.list({
			pageSize: 100,
			pageToken,
			q: "trashed = false",
			fields: "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink)",
		});

		for (const file of response.data.files ?? []) {
			if (!file.id) continue;

			await Document.upsert(
				{
					userId,
					provider: Provider.GOOGLE,
					externalId: file.id,
					title: file.name ?? "",
					content: "",
					url: file.webViewLink ?? "",
					mimeType: file.mimeType ?? "",
					modifiedAt: new Date(file.modifiedTime ?? Date.now()),
				},
				{
					conflictPaths: ["userId", "provider", "externalId"],
				},
			);
		}

		pageToken = response.data.nextPageToken ?? undefined;
	} while (pageToken);
}
