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
import { indexGoogleDrive } from "./utils/index-google-drive";
import { Provider } from "./types";

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
			resolvers: [UserResolver, GoogleResolver, SearchResolver],
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

	// Google OAuth callback
	app.get("/auth/google/callback", expressIsAuth, async (req, res) => {
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
	});

	app.listen(parseInt(process.env.PORT), () => {
		console.log(`🚀 Server started on localhost:${process.env.PORT}`);
	});
};

main().catch((err: Error) => console.error(err));
