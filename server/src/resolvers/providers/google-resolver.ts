import { Ctx, UseMiddleware, Mutation, Resolver } from "type-graphql";
import { google } from "googleapis";
import crypto from "crypto";
import { isAuth } from "../../middleware/is-auth";
import { Context } from "../../types";

@Resolver()
export class GoogleResolver {
	@UseMiddleware(isAuth)
	@Mutation(() => String)
	async connectGoogle(@Ctx() { req }: Context): Promise<string> {
		const state = crypto.randomBytes(32).toString("hex");

		req.session.googleOAuthState = state;

		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI,
		);

		return oauth2Client.generateAuthUrl({
			access_type: "offline",
			prompt: "consent",
			state,
			scope: ["https://www.googleapis.com/auth/drive.readonly"],
		});
	}
}
