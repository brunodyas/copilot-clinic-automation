import type {
	AnalyticsObj,
	Project,
	ProjectStatusFilter,
	Task,
	TaskStatus,
	TaskStatusFilter,
} from "@/lib/graphql/types";

export type KanbanTask = Task & { projectName: string };

export const EMPTY_ANALYTICS: AnalyticsObj = {
	totalProjects: 0,
	totalTasks: 0,
	todoTasks: 0,
	inProgressTasks: 0,
	completedTasks: 0,
	completionRate: 0,
};

export const TASK_STATUS_COLUMNS: readonly TaskStatus[] = [
	"TODO",
	"IN_PROGRESS",
	"DONE",
];

export const normalizeTaskSearchQuery = (query: string) =>
	query.trim().toLowerCase();

export const calculateAnalytics = (projects: readonly Project[]): AnalyticsObj => {
	const totals = projects.reduce(
		(acc, project) => {
			acc.totalTasks += project.tasks.length;

			for (const task of project.tasks) {
				if (task.status === "DONE") {
					acc.completedTasks += 1;
				} else if (task.status === "IN_PROGRESS") {
					acc.inProgressTasks += 1;
				} else if (task.status === "TODO") {
					acc.todoTasks += 1;
				}
			}

			return acc;
		},
		{ ...EMPTY_ANALYTICS, totalProjects: projects.length },
	);

	return {
		...totals,
		completionRate:
			totals.totalTasks === 0 ?
				0
			: Math.round((totals.completedTasks / totals.totalTasks) * 100),
	};
};

export const filterProjectsByStatus = (
	projects: readonly Project[],
	projectStatus: ProjectStatusFilter,
) => {
	if (projectStatus === "ALL") {
		return projects;
	}

	return projects.filter((project) => project.status === projectStatus);
};

export const filterTasks = (
	tasks: readonly Task[],
	statusFilter: TaskStatusFilter,
	searchQuery: string,
) => {
	const normalizedSearchQuery = normalizeTaskSearchQuery(searchQuery);

	return tasks.filter((task) => {
		const matchesStatus =
			statusFilter === "ALL" || task.status === statusFilter;
		const matchesSearch =
			!normalizedSearchQuery ||
			task.title.toLowerCase().includes(normalizedSearchQuery);

		return matchesStatus && matchesSearch;
	});
};

export const buildKanbanTaskGroups = (projects: readonly Project[]) => {
	const tasksByStatus = new Map<TaskStatus, KanbanTask[]>();
	const tasksById = new Map<string, KanbanTask>();

	for (const status of TASK_STATUS_COLUMNS) {
		tasksByStatus.set(status, []);
	}

	for (const project of projects) {
		for (const task of project.tasks) {
			const kanbanTask = { ...task, projectName: project.name };
			tasksById.set(task.id, kanbanTask);
			tasksByStatus.get(task.status)!.push(kanbanTask);
		}
	}

	return { tasksByStatus, tasksById };
};
