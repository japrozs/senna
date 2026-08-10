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
	RegisterDocument,
	RegularErrorFragmentDoc,
	RegularUserResponseFragmentDoc,
} from "@/generated/graphql";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { toErrorMap } from "@/utils/to-error-map";
import { useFragment } from "@/generated";

interface SignupProps {}

const Signup: React.FC = ({}) => {
	useIsAuth();

	const [registerMut] = useMutation(RegisterDocument);
	const [loading, setLoading] = useState(false);

	const router = useRouter();
	const client = useApolloClient();

	return (
		<div
			style={{
				marginTop: "8.8vh",
			}}
			className="w-80 ml-auto mr-auto flex flex-col items-center justify-center"
		>
			<p className="menlo text-gray-400">$$$$$ [senna] $$$$$</p>

			<Formik
				initialValues={{
					username: "",
					name: "",
					email: "",
					password: "",
				}}
				onSubmit={async (values, { setErrors }) => {
					const response = await registerMut({
						variables: {
							options: values,
						},
					});

					if (response.data?.register) {
						const registerResponse = useFragment(
							RegularUserResponseFragmentDoc,
							response.data.register,
						);

						if (registerResponse.errors) {
							const errors = registerResponse.errors.map(
								(error) =>
									useFragment(RegularErrorFragmentDoc, error),
							);

							setErrors(toErrorMap(errors));
						} else if (registerResponse.user) {
							setLoading(true);

							router.push("/app");

							await client.resetStore();
						}
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="name"
							label="Name"
							placeholder="olaolu slawn"
						/>
						<InputField
							name="email"
							label="Email"
							placeholder="ol@slawn.net"
						/>
						<InputField
							name="password"
							label="Password"
							type="password"
							placeholder="slimowa.ftr"
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
				Already have an account?{" "}
				<Link
					href="/login"
					className="hover:text-primary-color underline decoration-dotted"
				>
					Log in
				</Link>
			</p>

			{/* TODO – add functionality to forget your password, if that makes sense */}
		</div>
	);
};

export default Signup;
