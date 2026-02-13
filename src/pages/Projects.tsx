import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProjectCard from "@/components/cards/ProjectCard";
import ProjectEditor from "@/components/projects/ProjectEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<ProjectStatus>>(() => new Set());
  const [selectedTechnologies, setSelectedTechnologies] = useState<Set<string>>(() => new Set());

  const projectsQuery = useProjectsQuery();
  const createProject = useCreateProjectMutation();
  const updateProject = useUpdateProjectMutation();
  const deleteProject = useDeleteProjectMutation();

  const projects = projectsQuery.data ?? [];

  const availableStatuses = useMemo(() => {
    const set = new Set<ProjectStatus>();
    for (const p of projects) set.add(p.status);
    const order: ProjectStatus[] = ["In Progress", "Planning", "Completed"];
    return order.filter((s) => set.has(s));
  }, [projects]);

  const availableTechnologies = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      for (const t of p.technologies ?? []) {
        const key = t.trim();
        if (key) set.add(key);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (selectedStatuses.size && !selectedStatuses.has(p.status)) return false;

      if (selectedTechnologies.size) {
        const hasAny = (p.technologies ?? []).some((t) => selectedTechnologies.has(t));
        if (!hasAny) return false;
      }

      if (!q) return true;
      const hay = `${p.title}\n${p.description}\n${p.status}\n${(p.technologies ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [projects, search, selectedStatuses, selectedTechnologies]);

  const clearFilters = () => {
    setSelectedStatuses(new Set());
    setSelectedTechnologies(new Set());
  };

  const toggleStatus = (status: ProjectStatus, checked: boolean) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (checked) next.add(status);
      else next.delete(status);
      return next;
    });
  };

  const toggleTechnology = (tech: string, checked: boolean) => {
    setSelectedTechnologies((prev) => {
      const next = new Set(prev);
      if (checked) next.add(tech);
      else next.delete(tech);
      return next;
    });
  };

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10 bg-secondary border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 max-h-[420px] overflow-y-auto">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-sm font-medium">Filter projects</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!selectedStatuses.size && !selectedTechnologies.size}
                >
                  Clear
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                  {availableStatuses.length ? (
                    availableStatuses.map((s) => {
                      const id = `project-status-${s}`;
                      const checked = selectedStatuses.has(s);
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <Checkbox
                            id={id}
                            checked={checked}
                            onCheckedChange={(v) => toggleStatus(s, Boolean(v))}
                          />
                          <Label htmlFor={id} className="text-sm text-foreground">
                            {s}
                          </Label>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No projects yet.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Technologies</p>
                  {availableTechnologies.length ? (
                    <div className="max-h-52 overflow-y-auto pr-1 space-y-2">
                      {availableTechnologies.map((t) => {
                        const id = `project-tech-${t}`;
                        const checked = selectedTechnologies.has(t);
                        return (
                          <div key={t} className="flex items-center gap-2">
                            <Checkbox
                              id={id}
                              checked={checked}
                              onCheckedChange={(v) => toggleTechnology(t, Boolean(v))}
                            />
                            <Label htmlFor={id} className="text-sm text-foreground">
                              {t}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No technologies yet.</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none"
            onClick={handleNewProject}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {filteredProjects.length ? (
          filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project.id}
              title={project.title}
              description={project.description}
              status={project.status}
              technologies={project.technologies}
              hasRepo={Boolean(project.repoUrl)}
              hasDemo={Boolean(project.demoUrl)}
              delay={index * 0.1}
              onEdit={() => handleEditProject(project)}
              onDelete={() => void handleDeleteProject(project.id)}
            />
          ))
        ) : (
          <div className="col-span-full">
            <p className="text-sm text-muted-foreground">
              No projects found. Try clearing filters or changing your search.
            </p>
          </div>
        )}
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
