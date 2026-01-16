import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProjectCard from "@/components/cards/ProjectCard";
import ProjectEditor from "@/components/projects/ProjectEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Search, Filter, Plus } from "lucide-react";
import type { Project, ProjectStatus } from "@/types/models";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useProjectsQuery,
  useUpdateProjectMutation,
} from "@/hooks/api/useProjects";

const Projects = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const projectsQuery = useProjectsQuery();
  const createProject = useCreateProjectMutation();
  const updateProject = useUpdateProjectMutation();
  const deleteProject = useDeleteProjectMutation();

  const projects = projectsQuery.data ?? [];

  const handleNewProject = () => {
    setEditingProject(undefined);
    setIsEditorOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditorOpen(true);
  };

  const handleSave = async (input: {
    id?: string;
    title: string;
    description: string;
    status: ProjectStatus;
    technologies: string[];
    repoUrl?: string;
    demoUrl?: string;
  }) => {
    try {
      const base = {
        title: input.title,
        description: input.description,
        status: input.status,
        technologies: input.technologies,
        repoUrl: input.repoUrl,
        demoUrl: input.demoUrl,
      };

      if (input.id) {
        await updateProject.mutateAsync({ id: input.id, patch: base });
        toast.success("Project updated");
      } else {
        await createProject.mutateAsync({ ...base, progress: 0 });
        toast.success("Project created");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save project";
      toast.error(message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Project deleted");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete project";
      toast.error(message);
    }
  };

  return (
    <DashboardLayout
      title="Projects"
      subtitle="Track your projects and showcase your work."
    >
      {/* Search and Actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button 
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleNewProject}
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {projects.map((project, index) => (
          <ProjectCard 
            key={project.id}
            title={project.title}
            description={project.description}
            status={project.status}
            progress={project.progress}
            technologies={project.technologies}
            hasRepo={Boolean(project.repoUrl)}
            hasDemo={Boolean(project.demoUrl)}
            delay={index * 0.1}
            onEdit={() => handleEditProject(project)}
            onDelete={() => void handleDeleteProject(project.id)}
          />
        ))}
      </motion.div>

      {/* Project Editor Modal */}
      <ProjectEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        project={editingProject}
        onSave={handleSave}
        onDelete={handleDeleteProject}
      />
    </DashboardLayout>
  );
};

export default Projects;
