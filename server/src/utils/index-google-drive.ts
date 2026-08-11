import { google } from "googleapis";
import { OAuthAccount } from "../entities/oauth-account";
import { Document } from "../entities/document";
import { Provider } from "../types";
import { Request, Response } from "express";

export async function indexGoogleDrive(userId: string) {
	const account = await OAuthAccount.findOne({
		where: {
			userId,
			provider: Provider.GOOGLE,
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

export const googleOAuthCallback = async (req: Request, res: Response) => {
	try {
		const { code, state } = req.query;

		if (!code || typeof code !== "string") {
			return res.status(400).send("Missing authorization code");
		}

		if (
			!state ||
			typeof state !== "string" ||
			state !== req.session.googleOAuthState
		) {
			return res.status(400).send("Invalid OAuth state");
		}

		// OAuth state has been successfully validated.
		delete req.session.googleOAuthState;

		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI,
		);

		// Exchange the authorization code for tokens.
		const { tokens } = await oauth2Client.getToken(code);

		if (!tokens.access_token) {
			return res
				.status(400)
				.send("Google did not return an access token");
		}

		oauth2Client.setCredentials(tokens);

		const userId = req.session.userId!;

		/*
		 * Find the Google account already connected
		 * to this Senna user.
		 */
		let account = await OAuthAccount.findOne({
			where: {
				userId,
				provider: Provider.GOOGLE,
			},
		});

		if (!account) {
			account = OAuthAccount.create({
				userId,
				provider: Provider.GOOGLE,
				providerAccountId: null,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token ?? null,
				expiresAt: tokens.expiry_date
					? new Date(tokens.expiry_date)
					: null,
			});
		} else {
			/*
			 * Google may not return a refresh token when
			 * reconnecting an existing account.
			 *
			 * Don't overwrite the existing refresh token
			 * with null.
			 */
			account.accessToken = tokens.access_token;

			if (tokens.refresh_token) {
				account.refreshToken = tokens.refresh_token;
			}

			1;
			account.expiresAt = tokens.expiry_date
				? new Date(tokens.expiry_date)
				: account.expiresAt;
		}

		await account.save();

		/*
		 * Index the user's Google Drive.
		 *
		 * For the MVP we're doing this synchronously.
		 * Later, this should become a background job.
		 */
		await indexGoogleDrive(userId);

		return res.redirect(
			`${process.env.CORS_ORIGIN}/settings?google=connected`,
		);
	} catch (error) {
		console.error("Google OAuth error:", error);

		return res.status(500).send("Failed to connect Google account");
	}
};
