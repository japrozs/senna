import { Button } from "@/components/custom/button";
import { InputField } from "@/components/custom/input-field";
import { useIsAuth } from "@/utils/use-is-auth";
import { Form, Formik } from "formik";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
	LoginDocument,
	RegularErrorFragmentDoc,
	RegularUserResponseFragmentDoc,
} from "@/generated/graphql";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { toErrorMap } from "@/utils/to-error-map";
import { useFragment } from "@/generated";

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
	useIsAuth();

	const [loginMut] = useMutation(LoginDocument);
	const [loading, setLoading] = useState(false);

	const client = useApolloClient();
	const router = useRouter();

	return (
		<div
			style={{
				marginTop: "13.8vh",
			}}
			className="w-80 ml-auto mr-auto flex flex-col items-center justify-center"
		>
			<Head>
				<title>senna – login</title>
			</Head>
			<p className="menlo text-gray-400">$$$$$ [senna] $$$$$</p>

			<Formik
				initialValues={{ email: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await loginMut({
						variables: values,
					});

					if (response.data?.login) {
						const loginResponse = useFragment(
							RegularUserResponseFragmentDoc,
							response.data.login,
						);

						if (loginResponse.errors) {
							const errors = loginResponse.errors.map((error) =>
								useFragment(RegularErrorFragmentDoc, error),
							);

							setErrors(toErrorMap(errors));
						} else if (loginResponse.user) {
							if (typeof router.query.next === "string") {
								router.push(router.query.next);
							} else {
								setLoading(true);

								await client.resetStore();

								router.push("/app");
							}
						}
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="email"
							label="Email"
							placeholder="lucien@palace.net"
						/>

						<InputField
							name="password"
							label="Password"
							type="password"
							placeholder="darkclarkeviews87"
						/>

						<Button
							loading={isSubmitting || loading}
							colored
							type="submit"
							label="Continue"
							className="mt-5"
						/>
					</Form>
				)}
			</Formik>

			<p className="mt-5 text-sm text-gray-500 font-medium">
				Don't have an account?{" "}
				<Link
					href="/signup"
					className="hover:text-primary-color underline decoration-dotted"
				>
					Sign up
				</Link>
			</p>

			{/* TODO – build pages for forgot password */}
		</div>
	);
};

export default Login;
