"use client";
import { AnalyticsObj, Project } from "@/lib/graphql/types";
import CardComponent from "./CardComponent";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const ChartsComponent = ({
	projects,
	analytics,
}: {
	projects: Project[];
	analytics: AnalyticsObj;
}) => {
	const completionTrendData = [
		{ name: "Start", completion: 0 },
		{ name: "Current", completion: analytics.completionRate },
	];
	const workloadData = projects.map((project) => ({
		name: project.name,
		tasks: project.tasks.length,
		completed: project.tasks.filter((task) => task.status === "DONE").length,
	}));

	const productivityData = [
		{ name: "TODO", value: analytics.todoTasks, fill: "#f59e0b" },
		{ name: "IN_PROGRESS", value: analytics.inProgressTasks, fill: "#3b82f6" },
		{ name: "DONE", value: analytics.completedTasks, fill: "#22c55e" },
	];

	return (
		<div className='grid h-auto min-w-0 gap-4 min-h-6 lg:h-84 lg:grid-cols-3'>
			<CardComponent title='Completion Trend'>
				<div className='h-60 w-full min-w-0 min-h-6'>
					<ResponsiveContainer width='100%' height='100%'>
						<LineChart data={completionTrendData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='name' />
							<YAxis domain={[0, 100]} />
							<Tooltip />
							<Line type='monotone' dataKey='completion' strokeWidth={2} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardComponent>
			<CardComponent title='Productivity Breakdown'>
				<div className='space-y-2'>
					<div className='flex justify-between gap-4 text-sm'>
						{productivityData.map((item) => (
							<div key={item.name} className='flex items-center gap-2'>
								<div
									className='h-3 w-3 rounded-full'
									style={{ backgroundColor: item.fill }}
								/>

								<span>{item.name} Tasks</span>
							</div>
						))}
					</div>

					<div className='h-60 min-h-6 w-full min-w-0'>
						<ResponsiveContainer
							width='100%'
							height='100%'
							minWidth={0}
							minHeight={undefined}
						>
							<PieChart>
								<Pie
									data={productivityData}
									dataKey='value'
									nameKey='name'
									outerRadius={90}
									label
								/>

								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
			</CardComponent>
			<CardComponent title='Workload by Project'>
				<div className='h-60 min-h-6 w-full min-w-0'>
					<ResponsiveContainer
						width='100%'
						height='100%'
						minWidth={0}
						minHeight={undefined}
					>
						<BarChart data={workloadData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='name' />
							<YAxis />
							<Tooltip />
							<Bar dataKey='tasks' />
							<Bar dataKey='completed' />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardComponent>
		</div>
	);
};

export default ChartsComponent;
