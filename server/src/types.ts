import { Request, Response } from "express";
import session from "express-session";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";

declare module "express-session" {
	interface SessionData {
		userId: any;
		googleOAuthState?: string;
	}
}

export type Context = {
	req: Request & { session: session.Session };
	redis: Redis;
	res: Response;
	conn: DataSource;
};

export type Provider = "google" | "github" | "dropbox";

export interface IndexedDocument {
	externalId: string;
	provider: Provider;

	title: string;
	content: string;

	url: string;

	mimeType: string;

	modifiedAt: Date;
}
