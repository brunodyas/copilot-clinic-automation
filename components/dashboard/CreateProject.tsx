import { CREATE_PROJECT, PROJECT_FRAGMENT } from "@/lib/graphql/gql-queries";
import { useMutation } from "@apollo/client/react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CreateProject = () => {
	const [projectName, setProjectName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isSubmittingRef = useRef(false);
	const [createProject] = useMutation(CREATE_PROJECT);

	const handleCreateProject = async () => {
		const name = projectName.trim();
		if (!name || isSubmittingRef.current) return;

		isSubmittingRef.current = true;
		setIsSubmitting(true);

		try {
			await createProject({
				variables: {
					name,
				},
				optimisticResponse: {
					createProject: {
						__typename: "Project",
						id: `temp-project-${Date.now()}`,
						name,
						status: "ACTIVE",
						tasks: [],
					},
				},
				update(cache, { data }) {
					const newProject = data?.createProject;
					if (!newProject) return;

					cache.modify({
						fields: {
							projects(existingProjectRefs = []) {
								const newProjectRef = cache.writeFragment({
									data: newProject,
									fragment: PROJECT_FRAGMENT,
									fragmentName: "CachedProject",
								});

								return [newProjectRef, ...existingProjectRefs];
							},
						},
					});
				},
			});
			toast.success("Project created successfully!");
			setProjectName("");
		} catch (error) {
			toast.error(`Project creation failed ${error}`);
		} finally {
			isSubmittingRef.current = false;
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<p className='font-semibold text-medium'>CREATE PROJECT</p>
			<div className='flex gap-2'>
				<Input
					className='rounded border px-3 py-2'
					placeholder='New project name'
					value={projectName}
					disabled={isSubmitting}
					onChange={(e) => setProjectName(e.target.value)}
				/>

				<Button
					className='rounded bg-primary px-4 py-2 text-primary-foreground'
					onClick={handleCreateProject}
					disabled={isSubmitting || !projectName.trim()}
				>
					{isSubmitting ? "Creating..." : "Create"}
				</Button>
			</div>
		</>
	);
};

export default CreateProject;
