import {
	Dispatch,
	SetStateAction,
	startTransition,
	useMemo,
	useState,
} from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	getOptionLabel,
	ProjectStatusFilter,
	projectStatusOptions,
	TaskStatusFilter,
	taskStatusOptions,
} from "@/lib/graphql/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DebouncedFunction<Args extends unknown[]> = {
	(...args: Args): void;
	cancel: () => void;
};

const debouncedSearch = <Args extends unknown[]>(
	fn: (...args: Args) => void,
	delay: number,
): DebouncedFunction<Args> => {
	let timer: ReturnType<typeof setTimeout> | undefined;

	const debounced = ((...args: Args) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	}) as DebouncedFunction<Args>;

	debounced.cancel = () => {
		if (timer) clearTimeout(timer);
		timer = undefined;
	};

	return debounced;
};

type FilterSearchComponentProps = {
	projectStatus: ProjectStatusFilter;
	setProjectStatus: Dispatch<SetStateAction<ProjectStatusFilter>>;
	taskStatusFilter: TaskStatusFilter;
	setTaskStatusFilter: Dispatch<SetStateAction<TaskStatusFilter>>;
	taskSearchQuery: string;
	setTaskSearchQuery: Dispatch<SetStateAction<string>>;
	clearFilters: () => void;
	hasActiveFilters: boolean;
};

const FilterSearchComponent = ({
	projectStatus,
	setProjectStatus,
	taskStatusFilter,
	setTaskStatusFilter,
	setTaskSearchQuery,
	clearFilters,
	hasActiveFilters,
}: FilterSearchComponentProps) => {
	const [inputValue, setInputValue] = useState("");

	const handleTaskSelect = (val: string) => {
		startTransition(() => {
			setTaskStatusFilter(val as TaskStatusFilter);
		});
	};
	const handleProjectSelect = (val: string) => {
		startTransition(() => {
			setProjectStatus(val as ProjectStatusFilter);
		});
	};
	const debouncedSetTaskSearchQuery = useMemo(
		() => debouncedSearch((val: string) => setTaskSearchQuery(val), 500),
		[setTaskSearchQuery],
	);

	const handleSearchChange = (value: string) => {
		setInputValue(value);
		debouncedSetTaskSearchQuery(value.trim().toLowerCase());
	};

	const handleClearFilters = () => {
		debouncedSetTaskSearchQuery.cancel();
		setInputValue("");
		clearFilters();
	};
	return (
		<div className='rounded-lg border bg-muted/20 p-3'>
			<div className='grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-3'>
				<label className='space-y-1 text-sm font-medium'>
					<span>Project status</span>
					<Select value={projectStatus} onValueChange={handleProjectSelect}>
						<SelectTrigger>
							<SelectValue>
								{getOptionLabel(projectStatusOptions, projectStatus)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{projectStatusOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</label>
				<label className='space-y-1 text-sm font-medium'>
					<span>Task status</span>
					<Select value={taskStatusFilter} onValueChange={handleTaskSelect}>
						<SelectTrigger>
							<SelectValue>
								{getOptionLabel(taskStatusOptions, taskStatusFilter)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{taskStatusOptions.map((option) => (
								<SelectItem key={option.label} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</label>
				<label className='space-y-1 text-sm font-medium'>
					<span>Search Tasks</span>
					<Input
						className='rounded border px-2 py-1 text-sm'
						placeholder='Search Task...'
						value={inputValue}
						onChange={(e) => handleSearchChange(e.target.value)}
					/>
				</label>
			</div>
			<div className='space-y-1 text-sm font-medium'>
				<span>Filter actions</span>
				<Button
					type='button'
					variant='outline'
					className='h-10 w-full'
					disabled={!hasActiveFilters}
					onClick={handleClearFilters}
				>
					Clear filters
				</Button>
			</div>
		</div>
	);
};

export default FilterSearchComponent;
