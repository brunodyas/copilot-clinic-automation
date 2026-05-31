import SignupForm from "@/components/dashboard/SignupForm";
// Category
// SSG/static shell with client hydration.
// Why
// app/signup/page.tsx starts with "use client", which means the page is a Client Component.
// However, the initial render does not need server-side data. The form is rendered with local React state, and the actual signup
// request only happens after the user submits the form using fetch("/api/signup").
// Why not SSR?
// The page does not need per-user server information to show the signup form. Every visitor sees the same initial form. The server is only contacted after submission
// through the API route.
const SignUpPage = () => {
	return (
		<main className='flex min-h-screen items-center justify-center p-6'>
			<SignupForm />
		</main>
	);
};

export default SignUpPage;
