import { redirect } from "next/navigation";
// Category
// Static redirect-style route.
// Why
// The root page always redirects to /dashboard; it does not inspect cookies, headers, database state, or any other request-specific input.
export default function Home() {
	redirect("/dashboard");
}
