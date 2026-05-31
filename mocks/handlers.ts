import { graphql, HttpResponse, delay } from "msw";

import {
	createMockProject,
	createMockTask,
	deleteMockProject,
	deleteMockTask,
	findMockProject,
	getMockProjects,
	updateMockProjectName,
	updateMockProjectStatus,
	updateMockTaskStatus,
} from "./data";
import { TaskStatus } from "@/app/generated/graphql/client";

const GRAPHQL_ENDPOINT = "/api/graphql";
const MOCK_LATENCY_MS = 450;

type GraphQLVariables = Record<string, unknown>;

const graphqlError = (message: string, status = 200) =>
	HttpResponse.json(
		{
			errors: [{ message }],
		},
		{ status },
	);

const requireString = (variables: GraphQLVariables, key: string) => {
	const value = variables[key];

	return typeof value === "string" ? value.trim() : "";
};

const shouldFailNextRequest = () => {
	if (typeof window === "undefined") return false;

	const key = "mockGraphQL:failNext";
	const shouldFail = window.localStorage.getItem(key) === "true";

	if (shouldFail) {
		window.localStorage.removeItem(key);
	}

	return shouldFail;
};

const withLatency = async () => {
	await delay(MOCK_LATENCY_MS);

	if (shouldFailNextRequest()) {
		return graphqlError("Mock GraphQL network failure", 503);
	}

	return null;
};

const graphQLApi = graphql.link(GRAPHQL_ENDPOINT);

export const handlers = [
	graphQLApi.query("GetProjects", async () => {
		const failure = await withLatency();
		if (failure) return failure;

		return HttpResponse.json({
			data: {
				projects: getMockProjects(),
			},
		});
	}),

	graphQLApi.mutation("CreateProject", async ({ variables }) => {
		const failure = await withLatency();
		if (failure) return failure;

		const name = requireString(variables, "name");

		if (!name) {
			return graphqlError("Project name is required");
		}

		return HttpResponse.json({
			data: {
				createProject: createMockProject(name),
			},
		});
	}),

	graphQLApi.mutation("UpdateProjectName", async ({ variables }) => {
		const failure = await withLatency();
		if (failure) return failure;

		const projectId = requireString(variables, "projectId");
		const name = requireString(variables, "name");
		const project = updateMockProjectName(projectId, name);

		if (!project) {
			return graphqlError("Project not found");
		}

		return HttpResponse.json({
			data: {
				updateProjectName: project,
			},
		});
	}),

	graphQLApi.mutation("UpdateProjectStatus", async ({ variables }) => {
		const failure = await withLatency();
		if (failure) return failure;

		const projectId = requireString(variables, "projectId");
		const status = requireString(variables, "status");
		const project = updateMockProjectStatus(projectId, status);

		if (!project) {
			return graphqlError("Project not found");
		}

		return HttpResponse.json({
			data: {
				updateProjectStatus: project,
			},
		});
	}),

	graphQLApi.mutation("DeleteProject", async ({ variables }) => {
		const failure = await withLatency();
		if (failure) return failure;

		const projectId = requireString(variables, "projectId");
		const project = deleteMockProject(projectId);

		if (!project) {
			return graphqlError("Project not found");
		}

		return HttpResponse.json({
			data: {
				deleteProject: project,
			},
		});
	}),

	graphQLApi.mutation("CreateTask", async ({ variables }) => {
		const failure = await withLatency();
		if (failure) return failure;

		const projectId = requireString(variables, "projectId");
		const title = requireString(variables, "title");
		const clientMutationId =
			typeof variables.clientMutationId === "string" ?
				variables.clientMutationId
			:	null;

		if (!findMockProject(projectId)) {
			return graphqlError("Project not found");
		}

		if (!title) {
			return graphqlError("Task title is required");
		}

		return HttpResponse.json({
			data: {
				createTask: createMockTask(projectId, title, clientMutationId),
			},
		});
	}),

	graphQLApi.mutation("UpdateTaskStatus", async ({ variables }) => {
		const failure = await withLatency();
		if (failure) return failure;

		const taskId = requireString(variables, "taskId");
		const status = requireString(variables, "status") as TaskStatus;
		const task = updateMockTaskStatus(taskId, status);

		if (!task) {
			return graphqlError("Task not found");
		}

		return HttpResponse.json({
			data: {
				updateTaskStatus: task,
			},
		});
	}),

	graphQLApi.mutation("deleteTask", async ({ variables }) => {
		const failure = await withLatency();
		if (failure) return failure;

		const taskId = requireString(variables, "taskId");
		const task = deleteMockTask(taskId);

		if (!task) {
			return graphqlError("Task not found");
		}

		return HttpResponse.json({
			data: {
				deleteTask: task,
			},
		});
	}),
];
