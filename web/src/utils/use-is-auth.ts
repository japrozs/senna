import { NextRouter, useRouter } from "next/router";
import { useEffect } from "react";
import { MeDocument } from "../generated/graphql";
import { useQuery } from "@apollo/client/react";

export const useIsAuth = () => {
	const { data, loading, ...rest } = useQuery(MeDocument);
	const router: NextRouter = useRouter();

	useEffect(() => {
		if (["/login", "/signup", "/"].includes(router.pathname)) {
			if (!loading && data?.me != null) {
				router.push("/app");
			}
			return;
		}

		if (!loading && !data?.me) {
			router.replace("/");
		}
	}, [loading, data, router]);

	return { data, loading, ...rest };
};
