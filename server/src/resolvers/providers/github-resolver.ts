import { Ctx, Mutation, Resolver } from "type-graphql";
import crypto from "crypto";

interface Context {
	req: any;
	res: any;
}

@Resolver()
export class GitHubResolver {
	@Mutation(() => String)
	async connectGitHub(@Ctx() { req }: Context): Promise<string> {
		if (!req.session.userId) {
			throw new Error("Not authenticated");
		}

		const state = crypto.randomBytes(32).toString("hex");

		req.session.githubOAuthState = state;

		const params = new URLSearchParams({
			client_id: process.env.GITHUB_CLIENT_ID!,
			redirect_uri: process.env.GITHUB_REDIRECT_URI!,
			scope: "repo read:user",
			state,
		});

		return `https://github.com/login/oauth/authorize?${params.toString()}`;
	}
}
