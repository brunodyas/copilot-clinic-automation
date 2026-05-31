import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppApolloProvider } from "@/components/apollo-provider";
// Category
// SSR / dynamic server-rendered route.
// Why
// app/dashboard/page.tsx is an async Server Component that calls getServerSession(authOptions).
// That means the output depends on the current request’s authentication/session cookies. If there is no valid session,
// it redirects to /login. This is classic SSR/dynamic behavior:
export default async function DashboardPage() {
	let session = null;

	try {
		session = await getServerSession(authOptions);
	} catch {
		redirect("/login");
	}

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<AppApolloProvider>
			<DashboardClient />
		</AppApolloProvider>
	);
}
