import type {
	CachedProjectFragment,
	CachedTaskFragment,
	ProjectStatus,
	TaskStatus,
} from "@/app/generated/graphql/client";

export type Task = CachedTaskFragment;
export type Project = CachedProjectFragment;

export type AnalyticsObj = {
	totalProjects: number;
	totalTasks: number;
	todoTasks: number;
	inProgressTasks: number;
	completedTasks: number;
	completionRate: number;
};

export type ProjectStatusFilter = "ALL" | ProjectStatus;

export type TaskStatusFilter = "ALL" | TaskStatus;

export const projectStatusOptions: {
	label: string;
	value: ProjectStatusFilter;
}[] = [
	{ label: "All projects", value: "ALL" },
	{ label: "Active", value: "ACTIVE" },
	{ label: "Archived", value: "ARCHIVED" },
];

export const taskStatusOptions: { label: string; value: TaskStatusFilter }[] = [
	{ label: "All tasks", value: "ALL" },
	{ label: "To do", value: "TODO" },
	{ label: "In progress", value: "IN_PROGRESS" },
	{ label: "Done", value: "DONE" },
];

export const getOptionLabel = <T extends string>(
	options: { label: string; value: T }[],
	value: T,
) => options.find((option) => option.value === value)?.label ?? value;

export type LoginPageProps = {
	searchParams: Promise<{
		email?: string | string[];
	}>;
};
