import { type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NameFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

type AuthFormShellProps = {
	title: string;
	submitLabel: string;
	email: string;
	password: string;
	passwordAutoComplete: "current-password" | "new-password";
	alternatePrompt: string;
	alternateHref: string;
	alternateLabel: string;
	onEmailChange: (value: string) => void;
	onPasswordChange: (value: string) => void;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
	nameField?: NameFieldProps;
};

const AuthFormShell = ({
	title,
	submitLabel,
	email,
	password,
	passwordAutoComplete,
	alternatePrompt,
	alternateHref,
	alternateLabel,
	onEmailChange,
	onPasswordChange,
	onSubmit,
	nameField,
}: AuthFormShellProps) => {
	return (
		<form
			onSubmit={onSubmit}
			className='w-full max-w-sm space-y-4 rounded-lg border p-6'
		>
			<h1 className='text-2xl font-bold'>{title}</h1>

			{nameField && (
				<Input
					className='w-full rounded border px-3 py-2'
					placeholder='Name'
					value={nameField.value}
					name='name'
					autoComplete='name'
					onChange={(e) => nameField.onChange(e.target.value)}
				/>
			)}

			<Input
				className='w-full rounded border px-3 py-2'
				placeholder='Email'
				value={email}
				name='email'
				autoComplete='email'
				onChange={(e) => onEmailChange(e.target.value)}
			/>
			<Input
				className='w-full rounded border px-3 py-2'
				placeholder='Password'
				type='password'
				name='password'
				autoComplete={passwordAutoComplete}
				value={password}
				onChange={(e) => onPasswordChange(e.target.value)}
			/>
			<Button className='w-full rounded bg-primary px-4 py-2 text-primary-foreground'>
				{submitLabel}
			</Button>

			<p className='text-sm text-muted-foreground align-middle text-center'>
				{alternatePrompt}{" "}
				<a href={alternateHref} className='underline'>
					{alternateLabel}
				</a>
			</p>
		</form>
	);
};

export default AuthFormShell;
