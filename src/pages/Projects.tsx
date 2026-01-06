import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProjectCard from "@/components/cards/ProjectCard";
import ProjectEditor from "@/components/projects/ProjectEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";

const projects = [
  {
    title: "AI Knowledge Platform",
    description:
      "Full-stack app for storing personal knowledge with AI-powered insights.",
    status: "In Progress" as const,
    progress: 65,
    technologies: ["React", "Node.js", "MongoDB", "AI"],
    hasRepo: true,
    hasDemo: true,
  },
  {
    title: "Portfolio Website v2",
    description: "Modern portfolio with animations and dark theme.",
    status: "In Progress" as const,
    progress: 80,
    technologies: ["React", "Framer Motion", "Tailwind"],
    hasRepo: true,
    hasDemo: true,
  },
  {
    title: "Task Management API",
    description: "RESTful API with JWT authentication and role-based access.",
    status: "Completed" as const,
    progress: 100,
    technologies: ["Node.js", "Express", "PostgreSQL"],
    hasRepo: true,
    hasDemo: true,
  },
  {
    title: "E-commerce Dashboard",
    description:
      "Admin dashboard with analytics, inventory, and order management.",
    status: "Planning" as const,
    progress: 15,
    technologies: ["React", "TypeScript", "GraphQL"],
    hasRepo: true,
    hasDemo: false,
  },
];

const Projects = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof projects[0] | undefined>(undefined);

  const handleNewProject = () => {
    setEditingProject(undefined);
    setIsEditorOpen(true);
  };

  const handleEditProject = (project: typeof projects[0]) => {
    setEditingProject(project);
    setIsEditorOpen(true);
  };

  const handleDeleteProject = (title: string) => {
    console.log("Delete project:", title);
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
            key={project.title} 
            {...project} 
            delay={index * 0.1}
            onEdit={() => handleEditProject(project)}
            onDelete={() => handleDeleteProject(project.title)}
          />
        ))}
      </motion.div>

      {/* Project Editor Modal */}
      <ProjectEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        project={editingProject}
      />
    </DashboardLayout>
  );
};

export default Projects;
