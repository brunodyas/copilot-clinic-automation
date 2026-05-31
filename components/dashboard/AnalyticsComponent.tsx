import { AnalyticsObj, Project } from "@/lib/graphql/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CardComponent from "@/components/dashboard/CardComponent";

const ChartsComponent = dynamic(() => import("./ChartsComponent"), {
	ssr: false,
	loading: () => <ChartsFallback />,
});

const ChartsFallback = () => (
	<div className='grid min-w-0 gap-4 lg:grid-cols-3' aria-hidden='true'>
		{Array.from({ length: 3 }).map((_, index) => (
			<div
				key={index}
				className='h-96 min-h-96 animate-pulse rounded-xl border bg-muted/40'
			/>
		))}
	</div>
);

const AnalyticsComponent = ({
	analytics,
	projects,
}: {
	analytics: AnalyticsObj;
	projects: Project[];
}) => {
	const router = useRouter();
	const [renderCharts, setRenderCharts] = useState(false);

	const handleSignout = () => {
		router.push("/login");
	};

	useEffect(() => {
		if (typeof window === "undefined") return;

		if ("requestIdleCallback" in window) {
			const idleId = window.requestIdleCallback(() => {
				setRenderCharts(true);
			});

			return () => window.cancelIdleCallback(idleId);
		}

		const timeoutId = setTimeout(() => {
			setRenderCharts(true);
		}, 200);

		return () => clearTimeout(timeoutId);
	}, []);

	return (
		<>
			<div className='flex justify-between'>
				<div>
					<h1 className='min-h-9 text-3xl font-bold leading-tight'>
						Analytics Dashboard
					</h1>
					<p className='text-muted-foreground'>
						GraphQL-powered project insights
					</p>
				</div>
				<Button onClick={handleSignout}>Sign Out</Button>
			</div>

			<div className='grid gap-3 md:grid-cols-4'>
				<CardComponent
					title='Total Projects'
					contentClassName='text-3xl font-bold'
				>
					{analytics.totalProjects}
				</CardComponent>
				<CardComponent
					title='Total Tasks'
					contentClassName='text-3xl font-bold'
				>
					{analytics.totalTasks}
				</CardComponent>
				<CardComponent
					title='Completed Tasks'
					contentClassName='text-3xl font-bold'
				>
					{analytics.completedTasks}
				</CardComponent>
				<CardComponent
					title='Completion %'
					contentClassName='text-3xl font-bold'
				>
					{analytics.completionRate}
				</CardComponent>
			</div>
			{renderCharts ?
				<ChartsComponent analytics={analytics} projects={projects} />
			:	<ChartsFallback />}
		</>
	);
};

export default AnalyticsComponent;
