export {
	CreateProjectDocument as CREATE_PROJECT,
	CreateTaskDocument as CREATE_TASK,
	CachedProjectFragmentDoc as PROJECT_FRAGMENT,
	DeleteProjectDocument as DELETE_PROJECT,
	DeleteTaskDocument as DELETE_TASK,
	GetProjectsDocument as GET_PROJECTS,
	TaskCreatedDocument as TASK_CREATED_SUBSCRIPTION,
	CachedTaskFragmentDoc as TASK_FRAGMENT,
	UpdateProjectNameDocument as UPDATE_PROJECT_NAME,
	UpdateProjectStatusDocument as UPDATE_PROJECT_STATUS,
	UpdateTaskStatusDocument as UPDATE_TASK_STATUS,
} from "@/app/generated/graphql/client";
