import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pubsub, TASK_CREATED } from "@/lib/subpub";
import { createSchema, createYoga } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getServerSession, Session } from "next-auth";
import type {
	MutationCreateProjectArgs,
	MutationCreateTaskArgs,
	MutationDeleteProjectArgs,
	MutationDeleteTaskArgs,
	MutationUpdateProjectNameArgs,
	MutationUpdateProjectStatusArgs,
	MutationUpdateTaskStatusArgs,
	QueryProjectArgs,
} from "@/app/generated/graphql/server-types";

export type GraphQLContext = {
	session: Session | null;
};

// Made the GraphQL route explicitly dynamic on the Node.js runtime for long-lived Yoga/SSE subscription handling,
// and aligned clientMutationId with the nullable Prisma field so subscription payloads with older/null values do not violate the schema.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const typeDefs = readFileSync(
	join(process.cwd(), "graphql/schema.graphql"),
	"utf8",
);

const resolvers = {
	Query: {
		projects: async (_: unknown, __: unknown, context: GraphQLContext) => {
			//When you log in, the browser stores an auth cookie.Every request to /api/graphql automatically includes that cookie.
			//Then on the server:const session = await getServerSession(authOptions);gets the logged-in user from the cookie.
			const userId = context.session?.user?.id;

			if (!userId) throw new Error("Unauthorized");
			return prisma.project.findMany({
				where: {
					userId: userId,
				},
				include: {
					tasks: true, //to avoid 1+N qury problem
				},
				orderBy: {
					createdAt: "desc",
				},
			});
		},
		project: async (
			_: unknown,
			args: QueryProjectArgs,
			context: GraphQLContext,
		) => {
			const userId = context.session?.user?.id;
			if (!userId) throw new Error("Unauthorized");
			return prisma.project.findFirst({
				where: {
					id: args.id,
					userId,
				},
				include: {
					tasks: true,
				},
			});
		},
	},
	Subscription: {
		taskCreated: {
			subscribe: () => {
				console.log("Client subscribed to taskCreated");
				return pubsub.asyncIterableIterator([TASK_CREATED]);
			},
		},
	},
	Mutation: {
		createProject: async (
			_: unknown,
			args: MutationCreateProjectArgs,
			context: GraphQLContext,
		) => {
			const userId = context.session?.user?.id;

			if (!userId) {
				throw new Error("Unauthorized");
			}
			return prisma.project.create({
				data: {
					name: args.name,
					userId,
				},
				include: {
					tasks: true,
				},
			});
		},
		updateProjectName: async (
			_: unknown,
			args: MutationUpdateProjectNameArgs,
		) => {
			return prisma.project.update({
				where: { id: args.projectId },
				data: { name: args.name },
				include: { tasks: true },
			});
		},

		updateProjectStatus: async (
			_: unknown,
			args: MutationUpdateProjectStatusArgs,
		) => {
			return prisma.project.update({
				where: { id: args.projectId },
				data: { status: args.status },
				include: { tasks: true },
			});
		},

		deleteProject: async (_: unknown, args: MutationDeleteProjectArgs) => {
			return prisma.project.delete({
				where: { id: args.projectId },
				include: { tasks: true },
			});
		},
		createTask: async (_: unknown, args: MutationCreateTaskArgs) => {
			const task = await prisma.task.create({
				data: {
					title: args.title,
					projectId: args.projectId,
					status: "TODO",
					clientMutationId: args.clientMutationId,
				},
			});
			console.log("Publishing TASK_CREATED", task);
			await pubsub.publish(TASK_CREATED, {
				taskCreated: task,
			});

			return task;
		},
		updateTaskStatus: async (
			_: unknown,
			args: MutationUpdateTaskStatusArgs,
		) => {
			return prisma.task.update({
				where: { id: args.taskId },
				data: { status: args.status },
			});
		},
		deleteTask: async (_: unknown, args: MutationDeleteTaskArgs) => {
			return prisma.task.delete({
				where: { id: args.taskId },
			});
		},
	},
};
const yoga = createYoga({
	schema: createSchema({
		typeDefs,
		resolvers,
	}),
	context: async ({ request }) => {
		let session: Session | null = null;

		try {
			session = await getServerSession(authOptions);
		} catch {
			session = null;
		}

		return {
			session,
		};
	},
	graphqlEndpoint: "/api/graphql",
});
export { yoga as GET, yoga as POST };
