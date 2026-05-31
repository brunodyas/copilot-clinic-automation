import {
	ApolloClient,
	ApolloLink,
	HttpLink,
	InMemoryCache,
	Observable,
} from "@apollo/client";

import type { FetchResult } from "@apollo/client";

import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-sse";
import { print } from "graphql";
import { isGraphQLMockingEnabled } from "@/lib/api-mocking";
// Sent same-origin credentials on both GraphQL HTTP and SSE links so authenticated dashboard tabs keep cookies attached consistently.
const httpLink = new HttpLink({
	uri: "/api/graphql",
	credentials: "same-origin",
});

const sseClient =
	typeof window !== "undefined" && !isGraphQLMockingEnabled() ?
		createClient({
			url: "/api/graphql",
			credentials: "same-origin",
		})
	:	null;

const sseLink = new ApolloLink((operation) => {
	return new Observable<FetchResult>((observer) => {
		if (!sseClient) {
			observer.complete();
			return undefined;
		}

		const unsubscribe = sseClient.subscribe(
			{
				query: print(operation.query),
				variables: operation.variables,
			},
			{
				next: (result) => observer.next(result as FetchResult),
				error: (error) => observer.error(error),
				complete: () => observer.complete(),
			},
		);

		return () => {
			unsubscribe();
		};
	});
});

const splitLink =
	typeof window !== "undefined" ?
		ApolloLink.split(
			({ query }) => {
				const definition = getMainDefinition(query);

				return (
					definition.kind === "OperationDefinition" &&
					definition.operation === "subscription"
				);
			},
			sseLink,
			httpLink,
		)
	:	httpLink;

export const apolloClient = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					projects: {
						merge(_existing, incoming) {
							return incoming;
						},
					},
				},
			},
		},
	}),
});
