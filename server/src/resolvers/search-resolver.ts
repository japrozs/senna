import { Resolver, Query, Arg, UseMiddleware, Ctx } from "type-graphql";
import { Document } from "../entities/document";
import { isAuth } from "../middleware/is-auth";
import { Context } from "../types";

@Resolver()
export class SearchResolver {
	@UseMiddleware(isAuth)
	@Query(() => [Document])
	async search(@Arg("query") query: string, @Ctx() { req }: Context) {
		const userId = req.session.userId!;

		return Document.createQueryBuilder("d")
			.where("d.userId = :userId", {
				userId,
			})
			.andWhere(
				`(LOWER(d.title) LIKE LOWER(:query)
        OR LOWER(d.content) LIKE LOWER(:query))`,
				{
					query: `%${query}%`,
				},
			)
			.limit(20)
			.getMany();
	}
}
