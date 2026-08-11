import { Ctx, Mutation, Resolver } from "type-graphql";
import crypto from "crypto";

interface Context {
	req: any;
	res: any;
}

@Resolver()
export class NotionResolver {
	@Mutation(() => String)
	async connectNotion(@Ctx() { req }: Context): Promise<string> {
		const userId = req.session.userId;

		if (!userId) {
			throw new Error("Not authenticated");
		}

		const state = crypto.randomBytes(32).toString("hex");

		req.session.notionOAuthState = state;

		const params = new URLSearchParams({
			client_id: process.env.NOTION_CLIENT_ID!,
			response_type: "code",
			owner: "user",
			redirect_uri: process.env.NOTION_REDIRECT_URI!,
			state,
		});

		return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
	}
}
