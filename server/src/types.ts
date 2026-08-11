import { Request, Response } from "express";
import session from "express-session";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";

declare module "express-session" {
	interface SessionData {
		userId: string;
		googleOAuthState?: string;
		githubOAuthState?: string;
		dropboxOAuthState?: string;
		notionOAuthState?: string;
	}
}

export type Context = {
	req: Request & {
		session: session.Session;
	};
	redis: Redis;
	res: Response;
	conn: DataSource;
};

export enum Provider {
	GOOGLE = "google",
	GITHUB = "github",
	DROPBOX = "dropbox",
	NOTION = "notion",
}
