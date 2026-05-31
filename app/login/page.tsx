import LoginForm from "@/components/dashboard/LoginForm";

type LoginPageProps = {
	searchParams: Promise<{
		email?: string | string[];
	}>;
};
// Category
// SSG/static shell with client hydration.
// Why
// app/login/page.tsx is a simple page component. It does not call getServerSession(), does not read
// cookies directly, does not query the database, and does not use server-only request data.
// It renders a main wrapper and places LoginForm inside Suspense.
// Why not SSR?
// Because the login page does not need to know the logged-in user before rendering. It can show the same
// initial login form to everyone.
const LoginPage = async ({ searchParams }: LoginPageProps) => {
	const params = await searchParams;
	const initialEmail =
		typeof params.email === "string" ? params.email : (params.email?.[0] ?? "");

	return (
		<main className='flex min-h-screen items-center justify-center p-6'>
			<LoginForm initialEmail={initialEmail} />
		</main>
	);
};

export default LoginPage;
