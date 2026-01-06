import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectEditorProps {
  isOpen: boolean;
  onClose: () => void;
  project?: {
    title: string;
    description: string;
    status: "In Progress" | "Completed" | "Planning";
    technologies: string[];
    repoUrl?: string;
    demoUrl?: string;
  };
}

const ProjectEditor = ({ isOpen, onClose, project }: ProjectEditorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"In Progress" | "Completed" | "Planning">("Planning");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setStatus(project.status);
      setTechnologies(project.technologies);
      setRepoUrl(project.repoUrl || "");
      setDemoUrl(project.demoUrl || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("Planning");
      setTechnologies([]);
      setRepoUrl("");
      setDemoUrl("");
    }
  }, [project, isOpen]);

  const handleAddTech = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech("");
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies(technologies.filter((tech) => tech !== techToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleSave = () => {
    console.log("Saving project:", { title, description, status, technologies, repoUrl, demoUrl });
    onClose();
  };

  const handleDelete = () => {
    console.log("Deleting project");
    onClose();
  };

  const statusOptions: Array<"Planning" | "In Progress" | "Completed"> = ["Planning", "In Progress", "Completed"];

  const statusStyles = {
    "In Progress": "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30",
    Completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
    Planning: "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {project ? "Edit Project" : "New Project"}
              </h2>
              <div className="flex items-center gap-2">
                {project && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button variant="default" size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary rounded-md transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Title and Status Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Project Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter project title..."
                      className="bg-secondary border-border text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Status
                    </label>
                    <div className="flex gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => setStatus(option)}
                          className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                            status === option
                              ? statusStyles[option]
                              : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your project..."
                    className="bg-secondary border-border min-h-[120px] resize-none"
                  />
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Technologies / Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="px-3 py-1 cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                        onClick={() => handleRemoveTech(tech)}
                      >
                        {tech}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add technology..."
                      className="bg-secondary border-border"
                    />
                    <Button variant="outline" onClick={handleAddTech}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Repository URL
                    </label>
                    <Input
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Live Demo URL
                    </label>
                    <Input
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectEditor;
