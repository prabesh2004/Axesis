import { motion } from "framer-motion";
import { GitBranch, ExternalLink, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  status: "In Progress" | "Completed" | "Planning";
  technologies: string[];
  hasRepo?: boolean;
  hasDemo?: boolean;
  delay?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProjectCard = ({
  title,
  description,
  status,
  technologies,
  hasRepo = true,
  hasDemo = false,
  delay = 0,
  onEdit,
  onDelete,
}: ProjectCardProps) => {
  const statusStyles = {
    "In Progress": "bg-primary/20 text-primary",
    Completed: "bg-emerald-500/20 text-emerald-400",
    Planning: "bg-orange-500/20 text-orange-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-xl p-5 card-glow group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-secondary rounded-md transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Badge */}
      <span
        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md mb-3 ${statusStyles[status]}`}
      >
        {status}
      </span>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex items-center gap-4 pt-3 border-t border-border">
        {hasRepo && (
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <GitBranch className="w-4 h-4" />
            Repository
          </button>
        )}
        {hasDemo && (
          <button className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            <ExternalLink className="w-4 h-4" />
            Live Demo
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;
