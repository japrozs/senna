import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import NextTransitionBar from "next-transition-bar";

const client = new ApolloClient({
	link: new HttpLink({
		uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
		credentials: "include",
	}),
	cache: new InMemoryCache(),
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ApolloProvider client={client}>
			<NextTransitionBar color={"#007AFF"} showSpinner={false} />
			<Component {...pageProps} />
		</ApolloProvider>
	);
}
