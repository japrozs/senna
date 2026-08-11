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
import { GitHubResolver } from "./resolvers/providers/github-resolver";
import { indexGitHubRepositories } from "./utils/index-github-repositories";
import { DropboxResolver } from "./resolvers/providers/dropbox-resolver";
import { indexDropbox } from "./utils/index-dropbox";

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
				GoogleResolver,
				GitHubResolver,
				DropboxResolver,
				SearchResolver,
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

	app.get("/auth/github/callback", expressIsAuth, async (req, res) => {
		try {
			const { code, state } = req.query;

			if (!code || typeof code !== "string") {
				return res.status(400).send("Missing authorization code");
			}

			if (
				!state ||
				typeof state !== "string" ||
				state !== req.session.githubOAuthState
			) {
				return res.status(400).send("Invalid OAuth state");
			}

			delete req.session.githubOAuthState;

			const tokenResponse = await fetch(
				"https://github.com/login/oauth/access_token",
				{
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						client_id: process.env.GITHUB_CLIENT_ID,
						client_secret: process.env.GITHUB_CLIENT_SECRET,
						code,
						redirect_uri: process.env.GITHUB_REDIRECT_URI,
					}),
				},
			);

			const tokenData = await tokenResponse.json();

			if (!tokenData.access_token) {
				console.error("GitHub token error:", tokenData);

				return res
					.status(400)
					.send("GitHub did not return an access token");
			}

			const userId = req.session.userId!;

			let account = await OAuthAccount.findOne({
				where: {
					userId,
					provider: Provider.GITHUB,
				},
			});

			if (!account) {
				account = OAuthAccount.create({
					userId,
					provider: Provider.GITHUB,
					providerAccountId: null,
					accessToken: tokenData.access_token,
					refreshToken: null,
					expiresAt: null,
				});
			} else {
				account.accessToken = tokenData.access_token;
			}

			await account.save();

			await indexGitHubRepositories(userId);

			return res.redirect(
				`${process.env.CORS_ORIGIN}/settings?github=connected`,
			);
		} catch (error) {
			console.error("GitHub OAuth error:", error);

			return res.status(500).send("Failed to connect GitHub account");
		}
	});

	app.get("/auth/dropbox/callback", expressIsAuth, async (req, res) => {
		try {
			const { code, state } = req.query;

			if (!code || typeof code !== "string") {
				return res.status(400).send("Missing authorization code");
			}

			if (
				!state ||
				typeof state !== "string" ||
				state !== req.session.dropboxOAuthState
			) {
				return res.status(400).send("Invalid OAuth state");
			}

			delete req.session.dropboxOAuthState;

			const tokenResponse = await fetch(
				"https://api.dropboxapi.com/oauth2/token",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						code,
						grant_type: "authorization_code",
						client_id: process.env.DROPBOX_CLIENT_ID!,
						client_secret: process.env.DROPBOX_CLIENT_SECRET!,
						redirect_uri: process.env.DROPBOX_REDIRECT_URI!,
					}).toString(),
				},
			);

			const tokenData = await tokenResponse.json();

			if (!tokenResponse.ok || !tokenData.access_token) {
				console.error("Dropbox token error:", tokenData);

				return res
					.status(400)
					.send("Dropbox did not return an access token");
			}

			const userId = req.session.userId!;

			let account = await OAuthAccount.findOne({
				where: {
					userId,
					provider: Provider.DROPBOX,
				},
			});

			if (!account) {
				account = OAuthAccount.create({
					userId,
					provider: Provider.DROPBOX,
					providerAccountId: tokenData.account_id ?? null,
					accessToken: tokenData.access_token,
					refreshToken: tokenData.refresh_token ?? null,
					expiresAt: tokenData.expires_in
						? new Date(Date.now() + tokenData.expires_in * 1000)
						: null,
				});
			} else {
				account.accessToken = tokenData.access_token;

				if (tokenData.refresh_token) {
					account.refreshToken = tokenData.refresh_token;
				}

				if (tokenData.account_id) {
					account.providerAccountId = tokenData.account_id;
				}

				account.expiresAt = tokenData.expires_in
					? new Date(Date.now() + tokenData.expires_in * 1000)
					: account.expiresAt;
			}

			await account.save();

			/*
			 * Start indexing in the background.
			 * Don't make the user wait for Dropbox indexing.
			 */
			indexDropbox(userId)
				.then(() => {
					console.log(
						`Dropbox indexing completed for user ${userId}`,
					);
				})
				.catch((error) => {
					console.error(
						`Dropbox indexing failed for user ${userId}:`,
						error,
					);
				});

			return res.redirect(
				`${process.env.CORS_ORIGIN}/settings?dropbox=connected`,
			);
		} catch (error) {
			console.error("Dropbox OAuth error:", error);

			return res.status(500).send("Failed to connect Dropbox account");
		}
	});

	app.listen(parseInt(process.env.PORT), () => {
		console.log(`🚀 Server started on localhost:${process.env.PORT}`);
	});
};

main().catch((err: Error) => console.error(err));
