import {
	DELETE_PROJECT,
	UPDATE_PROJECT_NAME,
	UPDATE_PROJECT_STATUS,
} from "@/lib/graphql/gql-queries";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Project } from "@/lib/graphql/types";
import type { Reference } from "@apollo/client/cache";
import { toast } from "sonner";

const ProjectCRUD = ({ project }: { project: Project }) => {
	const { id, name, status } = project;
	const [editingProjectId, setEditingProjectId] = useState<string | null>("");
	const [editProjectName, setEditProjectName] = useState(name);
	const [updateProjectName] = useMutation(UPDATE_PROJECT_NAME);
	const [updateProjectStatus] = useMutation(UPDATE_PROJECT_STATUS);
	const [deleteProject] = useMutation(DELETE_PROJECT);

	const handleUpdateProject = () => {
		const nextStatus = status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
		try {
			updateProjectStatus({
				variables: {
					projectId: id,
					status: nextStatus,
				},
				optimisticResponse: {
					updateProjectStatus: {
						...project,
						status: nextStatus,
					},
				},
			});
			toast.success("Project status updated successfully");
		} catch (error) {
			toast.error(`Project status updation failed ${error}`);
		}
	};

	const handleDeleteProject = () => {
		try {
			deleteProject({
				variables: {
					projectId: id,
				},
				optimisticResponse: {
					deleteProject: {
						__typename: "Project",
						id: id,
					},
				},
				update(cache) {
					cache.modify({
						fields: {
							projects(
								existingProjectRefs: readonly Reference[] = [],
								{ readField },
							) {
								return existingProjectRefs.filter(
									(projectRef) => readField("id", projectRef) !== id,
								);
							},
						},
					});
				},
			});
			toast.success("Project deleted successfully");
		} catch (error) {
			toast.error(`Project deletion failed ${error}`);
		}
	};
	const handleUpdateProjectName = () => {
		const name = editProjectName.trim();
		if (!name) return;
		try {
			updateProjectName({
				variables: {
					projectId: id,
					name,
				},
				optimisticResponse: {
					updateProjectName: {
						...project,
						name,
					},
				},
			});
			toast.success("Project name updated successfully");
		} catch (error) {
			toast.error(`Project name updation failed ${error}`);
		}

		setEditingProjectId(null);
		setEditProjectName("");
	};

	const handleRename = () => {
		setEditingProjectId(id);
		setEditProjectName(name);
	};

	return (
		<>
			<div className='font-medium'>{name}</div>
			{editingProjectId === id ?
				<div className='flex gap-2'>
					<Input
						className='rounded border px-2 py-1'
						value={editProjectName}
						onChange={(e) => setEditProjectName(e.target.value)}
					/>

					<button
						className='rounded bg-primary px-3 text-sm text-primary-foreground'
						onClick={handleUpdateProjectName}
					>
						Save
					</button>
				</div>
			:	<div className='flex items-center gap-2'>
					<span>{name}</span>
					<button
						className='rounded bg-primary px-3 text-sm text-primary-foreground'
						onClick={handleRename}
					>
						Rename
					</button>
				</div>
			}
			<div className='text-sm text-muted-foreground'>Status: {status}</div>
			<Button
				className='rounded border px-3 py-1 text-sm'
				onClick={handleUpdateProject}
			>
				{status === "ARCHIVED" ? "Restore" : "Archive"}
			</Button>
			<Button
				className='rounded bg-destructive px-3 py-1 text-sm text-destructive-foreground'
				onClick={handleDeleteProject}
			>
				Delete
			</Button>
		</>
	);
};

export default ProjectCRUD;
