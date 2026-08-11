import "reflect-metadata";
import "dotenv-safe/config";
import { DataSource } from "typeorm";
import path from "path";
import express, { Application } from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import cors from "cors";
import { COOKIE_NAME } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { User } from "./entities/user";
import { UserResolver } from "./resolvers/user-resolver";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import playground from "graphql-playground-middleware-express";
import { GoogleResolver } from "./resolvers/providers/google-resolver";
import { SearchResolver } from "./resolvers/search-resolver";
import { Document } from "./entities/document";
import { OAuthAccount } from "./entities/oauth-account";
import { google } from "googleapis";
import { expressIsAuth } from "./middleware/is-auth";
import {
	googleOAuthCallback,
	indexGoogleDrive,
} from "./utils/index-google-drive";
import { Provider } from "./types";
import { GitHubResolver } from "./resolvers/providers/github-resolver";
import {
	githubOAuthCallback,
	indexGitHubRepositories,
} from "./utils/index-github-repositories";
import { DropboxResolver } from "./resolvers/providers/dropbox-resolver";
import { dropboxOAuthCallback, indexDropbox } from "./utils/index-dropbox";
import { indexNotion, notionOAuthCallback } from "./utils/index-notion";
import { NotionResolver } from "./entities/notion-resolver";

const main = async () => {
	const conn = new DataSource({
		type: "postgres",
		url: process.env.DATABASE_URL,
		logging: true,
		synchronize: true,
		migrations: [path.join(__dirname, "./migrations/*")],
		entities: [User, Document, OAuthAccount],
	});

	await conn.initialize();
	await conn.runMigrations();

	const app: Application = express();

	const redis = createClient({
		url: process.env.REDIS_URL,
	});

	redis.connect().catch(console.error);

	const redisStore = new RedisStore({
		client: redis,
		disableTouch: true,
	});

	app.set("trust proxy", 1);

	app.use(
		cors({
			origin: [
				"http://localhost:3000",
				"http://localhost:4000",
				"https://studio.apollographql.com",
				process.env.CORS_ORIGIN,
			],
			credentials: true,
		}),
	);

	app.use(
		session({
			name: COOKIE_NAME,
			store: redisStore,
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 7,
				httpOnly: true,
				secure: false,
				domain: undefined,
			},
			saveUninitialized: false,
			secret: process.env.SESSION_SECRET,
			resave: false,
		}) as any,
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [
				UserResolver,
				SearchResolver,
				GoogleResolver,
				GitHubResolver,
				DropboxResolver,
				NotionResolver,
			],
			validate: false,
		}),

		context: ({ req, res }) => ({
			req,
			res,
			redis,
			conn,
		}),

		plugins: [ApolloServerPluginLandingPageLocalDefault()],
	});

	await apolloServer.start();

	app.get(
		"/graphql",
		playground({
			endpoint: "/graphql",
		}),
	);

	apolloServer.applyMiddleware({
		app: app as any,
		cors: false,
		path: "/graphql",
	});

	app.get("/auth/google/callback", expressIsAuth, googleOAuthCallback);
	app.get("/auth/github/callback", expressIsAuth, githubOAuthCallback);
	app.get("/auth/dropbox/callback", expressIsAuth, dropboxOAuthCallback);
	app.get("/auth/notion/callback", expressIsAuth, notionOAuthCallback);

	app.listen(parseInt(process.env.PORT), () => {
		console.log(`🚀 Server started on localhost:${process.env.PORT}`);
	});
};

main().catch((err: Error) => console.error(err));
