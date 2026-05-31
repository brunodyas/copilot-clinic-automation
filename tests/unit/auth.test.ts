import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Awaitable, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";

type Credentials = {
	email: string;
	password: string;
};

type CredentialsProvider = {
	options: {
		authorize: (credentials: Credentials) => Awaitable<User | null>;
	};
};

const getCredentialsProvider = async () => {
	const { authOptions } = await import("@/lib/auth");

	return authOptions.providers[0] as CredentialsProvider;
};
const findUnique = vi.fn();
const compare = vi.fn();

vi.mock("@/lib/prisma", () => ({
	prisma: { user: { findUnique } },
}));

vi.mock("bcrypt", () => ({
	default: { compare },
}));

describe("auth options", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns null for missing credentials", async () => {
		const provider = await getCredentialsProvider();
		const result = await provider.options.authorize({
			email: "",
			password: "",
		});
		expect(result).toBeNull();
	});

	it("returns null when user not found", async () => {
		findUnique.mockResolvedValueOnce(null);
		const provider = await getCredentialsProvider();
		const result = await provider.options.authorize({
			email: "a@b.com",
			password: "x",
		});
		expect(result).toBeNull();
	});

	it("returns null for invalid password and user object for valid password", async () => {
		findUnique.mockResolvedValueOnce({
			id: "1",
			email: "a@b.com",
			name: "A",
			password: "hash",
		});
		compare.mockResolvedValueOnce(false);

		const provider = await getCredentialsProvider();
		expect(
			await provider.options.authorize({ email: "a@b.com", password: "bad" }),
		).toBeNull();

		findUnique.mockResolvedValueOnce({
			id: "1",
			email: "a@b.com",
			name: "A",
			password: "hash",
		});
		compare.mockResolvedValueOnce(true);
		expect(
			await provider.options.authorize({ email: "a@b.com", password: "good" }),
		).toEqual({ id: "1", email: "a@b.com", name: "A" });
	});

	it("covers jwt and session callbacks", async () => {
		const { authOptions } = await import("@/lib/auth");
		const adapterUser: AdapterUser = {
			id: "u1",
			email: "u1@example.com",
			emailVerified: null,
		};
		const jwt = await authOptions.callbacks!.jwt!({
			token: {} as JWT,
			user: adapterUser,
		});
		expect(jwt).toEqual({ id: "u1" });

		const jwtNoUser = await authOptions.callbacks!.jwt!({
			token: { a: 1 } as JWT,
			user: undefined,
		});
		expect(jwtNoUser).toEqual({ a: 1 });

		const session: Session = {
			expires: "",
			user: { id: "", email: null, image: null, name: null },
		};
		const token = { id: "u2" } satisfies JWT;
		const sess = await authOptions.callbacks!.session!({
			session,
			token,
		});
		expect(sess.user.id).toBe("u2");

		const sessionWithoutUser = {} as Session;
		const sessNoUser = await authOptions.callbacks!.session!({
			session: sessionWithoutUser,
			token,
		});
		expect(sessNoUser).toEqual({});
	});
});
