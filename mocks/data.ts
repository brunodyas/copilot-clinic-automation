import type { Project, Task, TaskStatus } from "@/lib/graphql/types";

export type MockProject = Project & {
	createdAt: string;
	tasks: MockTask[];
};

export type MockTask = Task & {
	createdAt: string;
};

const now = new Date("2026-05-11T09:00:00.000Z");

const isoMinutesAgo = (minutes: number) =>
	new Date(now.getTime() - minutes * 60_000).toISOString();

export const mockProjects: MockProject[] = [
	{
		__typename: "Project",
		id: "mock-project-revenue",
		name: "Revenue Intelligence",
		status: "ACTIVE",
		createdAt: isoMinutesAgo(15),
		tasks: [
			{
				__typename: "Task",
				id: "mock-task-forecast",
				title: "Validate Q2 forecast anomalies",
				status: "IN_PROGRESS",
				projectId: "mock-project-revenue",
				createdAt: isoMinutesAgo(12),
				clientMutationId: null,
			},
			{
				__typename: "Task",
				id: "mock-task-alerts",
				title: "Publish executive alert thresholds",
				status: "TODO",
				projectId: "mock-project-revenue",
				createdAt: isoMinutesAgo(8),
				clientMutationId: null,
			},
		],
	},
	{
		__typename: "Project",
		id: "mock-project-retention",
		name: "Customer Retention Dashboard",
		status: "ACTIVE",
		createdAt: isoMinutesAgo(45),
		tasks: [
			{
				__typename: "Task",
				id: "mock-task-cohorts",
				title: "Backfill cohort churn metrics",
				status: "DONE",
				projectId: "mock-project-retention",
				createdAt: isoMinutesAgo(41),
				clientMutationId: null,
			},
			{
				__typename: "Task",
				id: "mock-task-export",
				title: "Design CSV export smoke test",
				status: "TODO",
				projectId: "mock-project-retention",
				createdAt: isoMinutesAgo(32),
				clientMutationId: null,
			},
		],
	},
	{
		__typename: "Project",
		id: "mock-project-legacy",
		name: "Legacy KPI Migration",
		status: "ARCHIVED",
		createdAt: isoMinutesAgo(90),
		tasks: [
			{
				__typename: "Task",
				id: "mock-task-archive",
				title: "Archive deprecated widget specs",
				status: "DONE",
				projectId: "mock-project-legacy",
				createdAt: isoMinutesAgo(75),
				clientMutationId: null,
			},
		],
	},
];

let projectCounter = mockProjects.length + 1;
let taskCounter = mockProjects.reduce(
	(count, project) => count + project.tasks.length,
	1,
);

const cloneProject = (project: MockProject): MockProject => ({
	...project,
	tasks: project.tasks.map((task) => ({ ...task })),
});

export const getMockProjects = () => mockProjects.map(cloneProject);

export const findMockProject = (projectId: string) =>
	mockProjects.find((project) => project.id === projectId);

export const findMockTask = (taskId: string) => {
	for (const project of mockProjects) {
		const task = project.tasks.find((task) => task.id === taskId);

		if (task) {
			return { project, task };
		}
	}

	return null;
};

export const createMockProject = (name: string) => {
	const project: MockProject = {
		__typename: "Project",
		id: `mock-project-${projectCounter++}`,
		name,
		status: "ACTIVE",
		createdAt: new Date().toISOString(),
		tasks: [],
	};

	mockProjects.unshift(project);

	return cloneProject(project);
};

export const createMockTask = (
	projectId: string,
	title: string,
	clientMutationId?: string | null,
) => {
	const project = findMockProject(projectId);

	if (!project) return null;

	const task: MockTask = {
		__typename: "Task",
		id: `mock-task-${taskCounter++}`,
		title,
		status: "TODO",
		projectId,
		createdAt: new Date().toISOString(),
		clientMutationId: clientMutationId ?? null,
	};

	project.tasks.push(task);

	return { ...task };
};

export const updateMockProjectName = (projectId: string, name: string) => {
	const project = findMockProject(projectId);

	if (!project) return null;

	project.name = name;

	return cloneProject(project);
};

export const updateMockProjectStatus = (projectId: string, status: string) => {
	const project = findMockProject(projectId);

	if (!project) return null;

	project.status = status;

	return cloneProject(project);
};

export const deleteMockProject = (projectId: string) => {
	const projectIndex = mockProjects.findIndex(
		(project) => project.id === projectId,
	);

	if (projectIndex === -1) return null;

	const [deletedProject] = mockProjects.splice(projectIndex, 1);

	return deletedProject ? cloneProject(deletedProject) : null;
};

export const updateMockTaskStatus = (taskId: string, status: TaskStatus) => {
	const match = findMockTask(taskId);

	if (!match) return null;

	match.task.status = status;

	return { ...match.task };
};

export const deleteMockTask = (taskId: string) => {
	for (const project of mockProjects) {
		const taskIndex = project.tasks.findIndex((task) => task.id === taskId);

		if (taskIndex !== -1) {
			const [deletedTask] = project.tasks.splice(taskIndex, 1);

			return deletedTask ? { ...deletedTask } : null;
		}
	}

	return null;
};
