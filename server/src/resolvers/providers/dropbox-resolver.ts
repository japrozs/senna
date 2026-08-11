import { Mutation, Resolver, Ctx } from "type-graphql";
import crypto from "crypto";

interface Context {
	req: any;
	res: any;
}

@Resolver()
export class DropboxResolver {
	@Mutation(() => String)
	async connectDropbox(@Ctx() { req }: Context): Promise<string> {
		if (!req.session.userId) {
			throw new Error("Not authenticated");
		}

		const state = crypto.randomBytes(32).toString("hex");

		req.session.dropboxOAuthState = state;

		const params = new URLSearchParams({
			client_id: process.env.DROPBOX_CLIENT_ID!,
			redirect_uri: process.env.DROPBOX_REDIRECT_URI!,
			response_type: "code",
			token_access_type: "offline",
			state,
		});

		return `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
	}
}
