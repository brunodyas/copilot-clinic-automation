import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},

	providers: [
		Credentials({
			credentials: {
				email: {},
				password: {},
			},

			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: {
						email: String(credentials.email),
					},
				});

				if (!user) return null;

				const isValidPassword = await bcrypt.compare(
					String(credentials.password),
					user.password,
				);

				if (!isValidPassword) return null;

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
			}

			return session;
		},
	},

	secret: process.env.NEXTAUTH_SECRET,
};
