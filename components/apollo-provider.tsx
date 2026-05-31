"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { isGraphQLMockingEnabled } from "@/lib/api-mocking";

type MockingStatus = "disabled" | "starting" | "ready";

export function AppApolloProvider({ children }: { children: React.ReactNode }) {
	const [mockingStatus, setMockingStatus] = useState<MockingStatus>(() =>
		isGraphQLMockingEnabled() ? "starting" : "disabled",
	);

	useEffect(() => {
		if (!isGraphQLMockingEnabled()) return;

		let isMounted = true;

		const startWorker = async () => {
			const { worker } = await import("@/mocks/browser");

			await worker.start({
				onUnhandledRequest: "bypass",
				serviceWorker: {
					url: "/mockServiceWorker.js",
				},
			});

			if (isMounted) {
				setMockingStatus("ready");
			}
		};

		startWorker().catch((error) => {
			console.error("Failed to start MSW GraphQL mocks", error);
			if (isMounted) {
				setMockingStatus("disabled");
			}
		});

		return () => {
			isMounted = false;
		};
	}, []);

	if (mockingStatus === "starting") {
		return (
			<main className='min-h-screen bg-background p-6'>
				<div className='mx-auto max-w-5xl rounded-xl border p-6 text-sm text-muted-foreground'>
					Starting mocked GraphQL API…
				</div>
			</main>
		);
	}

	return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
