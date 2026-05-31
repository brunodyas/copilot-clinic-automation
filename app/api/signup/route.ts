import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
// This route handles POST requests, reads the request body, checks Prisma for an existing user, hashes the password, creates a user, and returns JSON.
// That is not SSG or SSR. It is server-side API logic.
export async function POST(req: Request) {
	const body = await req.json();

	const existingUser = await prisma.user.findUnique({
		where: {
			email: body.email,
		},
	});

	if (existingUser) {
		return Response.json({ error: "User already exists" }, { status: 400 });
	}

	const hashedPassword = await bcrypt.hash(body.password, 10);

	const user = await prisma.user.create({
		data: {
			email: body.email,
			password: hashedPassword,
			name: body.name,
		},
	});

	return Response.json(user);
}
