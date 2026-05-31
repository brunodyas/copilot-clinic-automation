import { calculateAnalytics } from "@/lib/dashboard-utils";
import type { Project } from "@/lib/graphql/types";

self.onmessage = (event: MessageEvent<Project[]>) => {
	self.postMessage(calculateAnalytics(event.data));
};
