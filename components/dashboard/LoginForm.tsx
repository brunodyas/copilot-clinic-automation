"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import AuthFormShell from "@/components/dashboard/AuthFormShell";

type LoginFormProps = {
	initialEmail?: string;
};

const LoginForm = ({ initialEmail = "" }: LoginFormProps) => {
	const [email, setEmail] = useState(initialEmail);
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const result = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});

		if (result?.error) {
			toast.error("Credentials entered are wrong!");
			router.push("/signup");
			return;
		}

		router.push("/dashboard");
	};

	return (
		<AuthFormShell
			title='Login'
			submitLabel='Login'
			email={email}
			password={password}
			passwordAutoComplete='current-password'
			alternatePrompt="Don't have an account?"
			alternateHref='/signup'
			alternateLabel='Sign up'
			onEmailChange={setEmail}
			onPasswordChange={setPassword}
			onSubmit={handleLogin}
		/>
	);
};

export default LoginForm;
