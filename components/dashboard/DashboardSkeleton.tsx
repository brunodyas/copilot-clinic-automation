import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
	return (
		<main className='min-h-screen p-6'>
			<div className='mx-auto max-w-5xl space-y-6'>
				<div className='grid gap-4 md:grid-cols-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className='rounded-lg border p-4 space-y-3'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-8 w-16' />
						</div>
					))}
				</div>
				<div className='rounded-lg border p-6 space-y-4'>
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className='space-y-2'>
							<Skeleton className='h-5 w-48' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-10 w-full' />
						</div>
					))}
				</div>
			</div>
		</main>
	);
};

export default DashboardSkeleton;
