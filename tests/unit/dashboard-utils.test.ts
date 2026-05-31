import { describe, expect, it } from "vitest";
import type { Project } from "@/lib/graphql/types";
import {
	buildKanbanTaskGroups,
	calculateAnalytics,
	filterProjectsByStatus,
	filterTasks,
	normalizeTaskSearchQuery,
	TASK_STATUS_COLUMNS,
} from "@/lib/dashboard-utils";

const projects: Project[] = [
	{
		__typename: "Project",
		id: "p1",
		name: "Website",
		status: "ACTIVE",
		tasks: [
			{
				__typename: "Task",
				id: "t1",
				title: "Design Homepage",
				status: "TODO",
				projectId: "p1",
			},
			{
				__typename: "Task",
				id: "t2",
				title: "Build API",
				status: "IN_PROGRESS",
				projectId: "p1",
			},
		],
	},
	{
		__typename: "Project",
		id: "p2",
		name: "Mobile App",
		status: "ARCHIVED",
		tasks: [
			{
				__typename: "Task",
				id: "t3",
				title: "Ship Release",
				status: "DONE",
				projectId: "p2",
			},
		],
	},
];

describe("dashboard utils", () => {
	it("calculates analytics in one pass over project task lists", () => {
		expect(calculateAnalytics(projects)).toEqual({
			totalProjects: 2,
			totalTasks: 3,
			todoTasks: 1,
			inProgressTasks: 1,
			completedTasks: 1,
			completionRate: 33,
		});
	});

	it("returns zeroed analytics when there are no tasks", () => {
		expect(
			calculateAnalytics([
				{
					__typename: "Project",
					id: "empty",
					name: "Empty",
					status: "ACTIVE",
					tasks: [],
				},
			]),
		).toEqual({
			totalProjects: 1,
			totalTasks: 0,
			todoTasks: 0,
			inProgressTasks: 0,
			completedTasks: 0,
			completionRate: 0,
		});
	});

	it("filters projects by status without copying when all are requested", () => {
		expect(filterProjectsByStatus(projects, "ALL")).toBe(projects);
		expect(filterProjectsByStatus(projects, "ARCHIVED")).toEqual([projects[1]]);
	});

	it("normalizes task searches and filters by status plus case-insensitive title", () => {
		expect(normalizeTaskSearchQuery("  HOME  ")).toBe("home");
		expect(filterTasks(projects[0].tasks, "ALL", "  home ")).toEqual([
			projects[0].tasks[0],
		]);
		expect(filterTasks(projects[0].tasks, "IN_PROGRESS", "api")).toEqual([
			projects[0].tasks[1],
		]);
		expect(filterTasks(projects[0].tasks, "DONE", "api")).toEqual([]);
		expect(filterTasks(projects[0].tasks, "TODO", "")).toEqual([
			projects[0].tasks[0],
		]);
	});

	it("builds kanban task groups and an id lookup for drag/drop", () => {
		const { tasksByStatus, tasksById } = buildKanbanTaskGroups(projects);

		expect(TASK_STATUS_COLUMNS).toEqual(["TODO", "IN_PROGRESS", "DONE"]);
		expect(tasksByStatus.get("TODO")).toEqual([
			expect.objectContaining({ id: "t1", projectName: "Website" }),
		]);
		expect(tasksByStatus.get("DONE")).toEqual([
			expect.objectContaining({ id: "t3", projectName: "Mobile App" }),
		]);
		expect(tasksById.get("t2")).toEqual(
			expect.objectContaining({ title: "Build API", projectName: "Website" }),
		);
	});
});
