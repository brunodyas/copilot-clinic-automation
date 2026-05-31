"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import AuthFormShell from "@/components/dashboard/AuthFormShell";

const SignupForm = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const res = await fetch("/api/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					email,
					password,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Something went wrong!");
			}

			toast.success("Account created successfully!");
			router.push(`/login?email=${encodeURIComponent(email)}`);
		} catch (error) {
			console.log(error, "error");

			toast.error(error instanceof Error ? error.message : "Signup failed");
		}
	};

	return (
		<AuthFormShell
			title='Sign Up'
			submitLabel='Create Account'
			email={email}
			password={password}
			passwordAutoComplete='new-password'
			alternatePrompt='Already have an account?'
			alternateHref='/login'
			alternateLabel='Login'
			onEmailChange={setEmail}
			onPasswordChange={setPassword}
			onSubmit={handleSignup}
			nameField={{
				value: name,
				onChange: setName,
			}}
		/>
	);
};

export default SignupForm;
