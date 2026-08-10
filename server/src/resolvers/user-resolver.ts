import {
	Resolver,
	Mutation,
	Arg,
	Field,
	Ctx,
	ObjectType,
	Query,
} from "type-graphql";
import { Context } from "../types";
import { User } from "../entities/user";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UserInput } from "../schemas/user-input";
import { validateRegister } from "../utils/validate-register";
import { sendEmail } from "../utils/send-email";
import { v4 } from "uuid";

@ObjectType()
export class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver(User)
export class UserResolver {
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Ctx() { redis, req }: Context,
	): Promise<UserResponse> {
		if (newPassword.length <= 2) {
			return {
				errors: [
					{
						field: "newPassword",
						message: "length must be greater than 2",
					},
				],
			};
		}

		const key = FORGET_PASSWORD_PREFIX + token;
		const userId = await redis.get(key);

		if (!userId) {
			return {
				errors: [
					{
						field: "token",
						message: "token expired",
					},
				],
			};
		}

		const user = await User.findOne({ where: { id: userId } });

		if (!user) {
			return {
				errors: [
					{
						field: "token",
						message: "user no longer exists",
					},
				],
			};
		}

		user.password = await argon2.hash(newPassword);
		await user.save();

		await redis.del(key);

		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() { redis }: Context,
	): Promise<boolean> {
		const user = await User.findOne({ where: { email } });
		if (!user) return false;

		const token = v4();

		await redis.set(
			FORGET_PASSWORD_PREFIX + token,
			user.id,
			"EX",
			1000 * 60 * 60 * 24 * 3, // 3 days
		);

		await sendEmail(
			email,
			`<a href="${process.env.CORS_ORIGIN}/changepass/${token}">reset password</a>`,
		);

		return true;
	}

	@Query(() => User, { nullable: true })
	async me(@Ctx() { req }: Context): Promise<User | null> {
		console.log(req.session.userId);
		if (!req.session.userId) {
			return null;
		}

		return await User.findOne({ where: { id: req.session.userId } });
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UserInput,
		@Ctx() { req, conn }: Context,
	): Promise<UserResponse> {
		const errors = validateRegister(options);
		if (errors) return { errors };

		const hashedPassword = await argon2.hash(options.password);

		let user: User;
		try {
			user = await conn.getRepository(User).save({
				name: options.name,
				email: options.email,
				password: hashedPassword,
			});
		} catch (err: any) {
			if (err.code === "23505") {
				return {
					errors: [
						{
							field: "email",
							message: "Email already taken",
						},
					],
				};
			}
			throw err;
		}

		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("usernameOrEmail") usernameOrEmail: string,
		@Arg("password") password: string,
		@Ctx() { req }: Context,
	): Promise<UserResponse> {
		const user = await User.findOne({
			where: { email: usernameOrEmail },
		});

		if (!user) {
			return {
				errors: [
					{
						field: "email",
						message: "that account doesn't exist",
					},
				],
			};
		}

		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "incorrect password",
					},
				],
			};
		}

		req.session.userId = user.id;
		console.log(req.session.userId);

		return { user };
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: Context): Promise<boolean> {
		return new Promise((resolve) => {
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME);
				if (err) {
					console.error(err);
					resolve(false);
					return;
				}
				resolve(true);
			});
		});
	}
}
