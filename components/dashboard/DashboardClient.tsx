"use client";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import {
	startTransition,
	Suspense,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import dynamic from "next/dynamic";
import { addtoQueue, clearQueue, getQueue } from "@/lib/offline-queue";
import {
	CREATE_TASK,
	GET_PROJECTS,
	TASK_CREATED_SUBSCRIPTION,
	TASK_FRAGMENT,
	UPDATE_TASK_STATUS,
} from "@/lib/graphql/gql-queries";
import type {
	ProjectStatusFilter,
	Task,
	TaskStatusFilter,
} from "@/lib/graphql/types";
import type { Reference } from "@apollo/client/cache";
import { toast } from "sonner";

import DashboardSkeleton from "./DashboardSkeleton";
import CardComponent from "@/components/dashboard/CardComponent";
import FilterSearchComponent from "./FilterSearchComponent";
import {
	EMPTY_ANALYTICS,
	filterProjectsByStatus,
	type KanbanTask,
} from "@/lib/dashboard-utils";
import { TaskStatus } from "@/app/generated/graphql/client";

const KanbanBoard = dynamic(() => import("./KanbanBoard"), {
	loading: () => (
		<div className='h-64 animate-pulse rounded-xl border bg-muted/40' />
	),
});
const AnalyticsComponent = dynamic(
	() => import("@/components/dashboard/AnalyticsComponent"),
	{
		loading: () => (
			<div className='h-48 animate-pulse rounded-xl border bg-muted/40' />
		),
	},
);
const CreateProject = dynamic(() => import("./CreateProject"), {
	loading: () => (
		<div className='h-24 animate-pulse rounded-xl border bg-muted/40' />
	),
});
const ProjectComponent = dynamic(
	() => import("@/components/dashboard/ProjectComponent"),
);
// Reused the same Apollo cache upsert path for both incoming taskCreated subscription events and local createTask
// mutation updates, preventing the tab that created the task from duplicating it while allowing the other tab to see it.
const upsertTaskRef = (
	existingTaskRefs: readonly Reference[] = [],
	newTaskRef: Reference | undefined,
	newTask: Task,
	readField: (fieldName: string, ref: Reference) => unknown,
) => {
	if (!newTaskRef) {
		return existingTaskRefs;
	}

	const filteredRefs = existingTaskRefs.filter((taskRef) => {
		const existingId = readField("id", taskRef);
		const existingClientMutationId = readField("clientMutationId", taskRef);

		return (
			existingId !== newTask.id &&
			(!newTask.clientMutationId ||
				existingClientMutationId !== newTask.clientMutationId)
		);
	});

	return [...filteredRefs, newTaskRef];
};
const DashboardClient = () => {
	const [isOffline, setIsOffline] = useState(false);

	const { data, loading, error } = useQuery(GET_PROJECTS, {
		fetchPolicy: "cache-and-network",
		nextFetchPolicy: "cache-first",
	});
	const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
	const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
	const [titles, setTitles] = useState<Record<string, string>>({});
	const [pendingTaskProjectIds, setPendingTaskProjectIds] = useState<
		Set<string>
	>(() => new Set());
	const pendingTaskProjectIdsRef = useRef(new Set<string>());
	const [createTask] = useMutation(CREATE_TASK);
	const [projectStatus, setProjectStatus] =
		useState<ProjectStatusFilter>("ALL");
	const [taskStatusFilter, setTaskStatusFilter] =
		useState<TaskStatusFilter>("ALL");
	const [taskSearchQuery, setTaskSearchQuery] = useState("");

	useSubscription(TASK_CREATED_SUBSCRIPTION, {
		onData: ({ client, data }) => {
			const newTask = data.data?.taskCreated;

			if (!newTask) return;

			client.cache.modify({
				id: client.cache.identify({
					__typename: "Project",
					id: newTask.projectId,
				}),
				fields: {
					tasks(existingTaskRefs: readonly Reference[] = [], { readField }) {
						const newTaskRef = client.cache.writeFragment({
							data: newTask,
							fragment: TASK_FRAGMENT,
						});

						return upsertTaskRef(
							existingTaskRefs,
							newTaskRef,
							newTask,
							readField,
						);
					},
				},
			});
		},
	});

	const handleMoveTask = async (task: KanbanTask, status: TaskStatus) => {
		const { id, title, projectId, clientMutationId } = task;
		try {
			await updateTaskStatus({
				variables: {
					taskId: id,
					status,
				},
				optimisticResponse: {
					updateTaskStatus: {
						__typename: "Task",
						id,
						status,
						title,
						projectId,
						clientMutationId,
					},
				},
			});
			toast.success("Task status updated");
		} catch (error) {
			toast.error(`Task status update failed ${error}`);
		}
	};
	const setTaskCreatePending = (projectId: string, isPending: boolean) => {
		const nextPendingIds = new Set(pendingTaskProjectIdsRef.current);

		if (isPending) {
			nextPendingIds.add(projectId);
		} else {
			nextPendingIds.delete(projectId);
		}

		pendingTaskProjectIdsRef.current = nextPendingIds;
		setPendingTaskProjectIds(nextPendingIds);
	};

	const handleClick = async (id: string) => {
		const title = titles[id]?.trim();
		if (!title || pendingTaskProjectIdsRef.current.has(id)) return;

		const clientMutationId = crypto.randomUUID();
		setTaskCreatePending(id, true);

		try {
			if (isOffline) {
				await addtoQueue({
					__typename: "Task",
					id: `temp-${clientMutationId}`,
					title,
					status: "TODO",
					projectId: id,
					clientMutationId,
				});
				toast.info("Saved offline. Will sync later.");
			} else {
				await createTask({
					variables: {
						projectId: id,
						title,
						clientMutationId,
					},
					optimisticResponse: {
						createTask: {
							__typename: "Task",
							id: `temp-${clientMutationId}`,
							title,
							status: "TODO",
							projectId: id,
							clientMutationId,
						},
					},
					update(cache, { data }) {
						const newTask = data?.createTask;
						if (!newTask) return;

						cache.modify({
							id: cache.identify({
								__typename: "Project",
								id: id,
							}),
							fields: {
								tasks(
									existingTaskRefs: readonly Reference[] = [],
									{ readField },
								) {
									const newTaskRef = cache.writeFragment({
										data: newTask,
										fragment: TASK_FRAGMENT,
									});

									return upsertTaskRef(
										existingTaskRefs,
										newTaskRef,
										newTask,
										readField,
									);
								},
							},
						});
					},
				});
				toast.success("Task created Successfully");
			}

			setTitles((prev) => ({
				...prev,
				[id]: "",
			}));
		} catch (error) {
			toast.error(`Failed to create task ${error}`);
		} finally {
			setTaskCreatePending(id, false);
		}
	};

	const initialProjects = useMemo(() => data?.projects ?? [], [data?.projects]);
	const deferredProjectStatusFilter = useDeferredValue(projectStatus);
	const hasActiveFilters = useMemo(
		() =>
			projectStatus !== "ALL" ||
			taskStatusFilter !== "ALL" ||
			taskSearchQuery.trim().length > 0,
		[projectStatus, taskStatusFilter, taskSearchQuery],
	);

	const filteredProjects = useMemo(
		() => filterProjectsByStatus(initialProjects, deferredProjectStatusFilter),
		[initialProjects, deferredProjectStatusFilter],
	);

	const clearFilters = () => {
		startTransition(() => {
			setProjectStatus("ALL");
			setTaskStatusFilter("ALL");
			setTaskSearchQuery("");
		});
	};

	useEffect(() => {
		const sync = async () => {
			if (!navigator.onLine) return;

			const queued = await getQueue();

			for (const task of queued) {
				await createTask({
					variables: {
						projectId: task.projectId,
						title: task.title,
						clientMutationId: task.clientMutationId,
					},
				});
			}

			if (queued.length > 0) {
				await clearQueue();
				console.log("Synced offline tasks");
			}
		};

		window.addEventListener("online", sync);

		return () => window.removeEventListener("online", sync);
	}, [createTask]);

	useEffect(() => {
		if (!initialProjects) return;

		const worker = new Worker(
			new URL("../../workers/analytics.worker.ts", import.meta.url),
		);

		worker.postMessage(initialProjects);

		worker.onmessage = (event) => {
			setAnalytics(event.data);
		};

		return () => worker.terminate();
	}, [initialProjects]);

	useEffect(() => {
		const updateOnlineStatus = () => {
			setIsOffline(!navigator.onLine);
		};

		updateOnlineStatus();

		window.addEventListener("online", updateOnlineStatus);
		window.addEventListener("offline", updateOnlineStatus);

		return () => {
			window.removeEventListener("online", updateOnlineStatus);
			window.removeEventListener("offline", updateOnlineStatus);
		};
	}, []);

	if (loading) return <DashboardSkeleton />;

	if (error) {
		toast.error(error.message);

		return <main className='p-6'>Something went wrong.</main>;
	}

	return (
		<main className='min-h-screen bg-background p-6'>
			<div className='mx-auto max-w-5xl space-y-6'>
				<AnalyticsComponent analytics={analytics} projects={initialProjects} />
				<KanbanBoard projects={initialProjects} onMoveTask={handleMoveTask} />
				<CreateProject />

				<CardComponent title='Projects'>
					<Suspense
						fallback={
							<div className='h-24 animate-pulse rounded-md bg-muted/40' />
						}
					>
						<div className='space-y-4'>
							<FilterSearchComponent
								projectStatus={projectStatus}
								setProjectStatus={setProjectStatus}
								taskStatusFilter={taskStatusFilter}
								setTaskStatusFilter={setTaskStatusFilter}
								taskSearchQuery={taskSearchQuery}
								setTaskSearchQuery={setTaskSearchQuery}
								clearFilters={clearFilters}
								hasActiveFilters={hasActiveFilters}
							/>
						</div>
						<div className='space-y-3'>
							{filteredProjects?.length === 0 ?
								<p className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground'>
									No projects match the current filters
								</p>
							:	filteredProjects.map((project) => (
									<ProjectComponent
										key={project.id}
										project={project}
										titles={titles}
										setTitles={setTitles}
										handleClick={handleClick}
										isCreatingTask={pendingTaskProjectIds.has(project.id)}
										taskSearchQuery={taskSearchQuery}
										taskStatusFilter={taskStatusFilter}
									/>
								))
							}
						</div>
					</Suspense>
				</CardComponent>
			</div>
		</main>
	);
};

export default DashboardClient;
