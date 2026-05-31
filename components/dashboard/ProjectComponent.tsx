import { type Task, type Project, TaskStatusFilter } from "@/lib/graphql/types";
import { filterTasks } from "@/lib/dashboard-utils";
import TaskComponent from "./TaskComponent";
import ProjectCRUD from "./ProjectCRUD";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	ChangeEvent,
	Dispatch,
	SetStateAction,
	useDeferredValue,
	useMemo,
} from "react";

type ProjectComponentProps = {
	project: Project;
	titles: Record<string, string>;
	setTitles: Dispatch<SetStateAction<Record<string, string>>>;
	handleClick: (id: string) => void;
	isCreatingTask: boolean;
	taskStatusFilter: TaskStatusFilter;
	taskSearchQuery: string;
};

const ProjectComponent = ({
	project,
	handleClick,
	titles,
	setTitles,
	isCreatingTask,
	taskStatusFilter,
	taskSearchQuery,
}: ProjectComponentProps) => {
	const { id, status } = project;
	const isDisabled = status !== "ACTIVE";

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setTitles((prev) => ({
			...prev,
			[id]: e.target.value,
		}));
	};
	const deferredTaskStatusFilter = useDeferredValue(taskStatusFilter);
	const filteredTasks = useMemo(
		() => filterTasks(project.tasks, deferredTaskStatusFilter, taskSearchQuery),
		[project.tasks, taskSearchQuery, deferredTaskStatusFilter],
	);

	return (
		<div key={id} className='rounded-lg border p-4'>
			<ProjectCRUD project={project} />

			<div className='mt-4 space-y-2'>
				<p className='text-sm font-medium'>Tasks</p>

				{project.tasks.length === 0 ?
					<p className='text-sm text-muted-foreground'>No tasks yet</p>
				: filteredTasks?.length === 0 ?
					<p className='text-sm text-muted-foreground'>
						No tasks for the filter selected
					</p>
				:	filteredTasks.map((task: Task) => (
						<TaskComponent task={task} key={task.id} projectId={id} />
					))
				}
				<div className='mt-3 flex gap-2'>
					<Input
						className='rounded border px-2 py-1 text-sm'
						placeholder='New task...'
						value={titles[id] || ""}
						disabled={isDisabled || isCreatingTask}
						onChange={handleChange}
					/>

					<Button
						className='rounded bg-primary px-3 text-sm text-primary-foreground'
						onClick={() => handleClick(id)}
						disabled={isDisabled || isCreatingTask || !titles[id]?.trim()}
					>
						{isCreatingTask ? "Adding..." : "Add"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ProjectComponent;
