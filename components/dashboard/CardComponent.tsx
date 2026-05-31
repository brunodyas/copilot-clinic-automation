import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CardComponentProps = {
	title: string;
	children: React.ReactNode;
	contentClassName?: string;
	cardClassName?: string;
};

const CardComponent = ({
	title,
	children,
	contentClassName,
	cardClassName,
}: CardComponentProps) => {
	return (
		<Card className={cn("min-h-6", cardClassName)}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>

			<CardContent className={contentClassName}>{children}</CardContent>
		</Card>
	);
};

export default CardComponent;
