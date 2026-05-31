import { Project, TaskStatus } from "@/lib/graphql/types";
import {
	buildKanbanTaskGroups,
	TASK_STATUS_COLUMNS,
	type KanbanTask,
} from "@/lib/dashboard-utils";
import { useMemo } from "react";
import {
	DndContext,
	DragEndEvent,
	useDraggable,
	useDroppable,
} from "@dnd-kit/core";
import { ChevronDown } from "lucide-react";

type KanbanBoardProps = {
	projects: Project[];
	onMoveTask: (task: KanbanTask, status: TaskStatus) => void;
};
const KanbanBoard = ({ projects, onMoveTask }: KanbanBoardProps) => {
	const { tasksByStatus, tasksById } = useMemo(
		() => buildKanbanTaskGroups(projects),
		[projects],
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const taskId = String(event.active.id);
		const nextStatus = event.over?.id as TaskStatus | undefined;
		if (!nextStatus) return;
		if (!TASK_STATUS_COLUMNS.includes(nextStatus)) return;
		const task = tasksById.get(taskId);
		if (!task || task.status === nextStatus) return;
		onMoveTask(task, nextStatus);
	};

	return (
		<DndContext onDragEnd={handleDragEnd}>
			<div className='grid min-h-6 gap-4 md:grid-cols-3'>
				{TASK_STATUS_COLUMNS.map((status) => (
					<KanbanColumn
						key={status}
						status={status}
						tasks={tasksByStatus.get(status) ?? []}
					/>
				))}
			</div>
		</DndContext>
	);
};

const KanbanColumn = ({
	status,
	tasks,
}: {
	status: TaskStatus;
	tasks: KanbanTask[];
}) => {
	const { setNodeRef, isOver } = useDroppable({
		id: status,
	});
	return (
		<div
			ref={setNodeRef}
			className={`min-h-6 rounded-lg border p-4 ${
				isOver ? "bg-muted" : "bg-background"
			}`}
		>
			<details open className='group'>
				<summary className='mb-4 flex cursor-pointer list-none items-center justify-between rounded-md p-1'>
					<div className='flex items-center gap-2'>
						<ChevronDown className='h-4 w-4 transition-transform group-open:rotate-180' />
						<h3 className='font-semibold'>{formatStatus(status)}</h3>
					</div>
					<span className='rounded-full border px-2 py-0.5 text-xs'>
						{tasks.length}
					</span>
				</summary>
				<div className='space-y-3'>
					{tasks.map((task) => (
						<KanbanTaskCard key={task.id} task={task} />
					))}
				</div>
			</details>
		</div>
	);
};

const formatStatus = (status: TaskStatus) => {
	return status.replace("_", " ");
};

const KanbanTaskCard = ({ task }: { task: KanbanTask }) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: task.id,
		});
	const style =
		transform ?
			{
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			}
		:	undefined;
	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={`cursor-grab rounded-lg border bg-card p-3 shadow-sm ${
				isDragging ? "opacity-50" : ""
			}`}
		>
			<p className='text-sm font-medium'>{task.title}</p>
			<p className='mt-1 text-xs text-muted-foreground'>{task.projectName}</p>
		</div>
	);
};

export default KanbanBoard;
