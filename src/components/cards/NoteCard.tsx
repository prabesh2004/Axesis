import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";

interface NoteCardProps {
  title: string;
  description: string;
  tags: string[];
  date: string;
  accentColor?: "cyan" | "purple" | "green" | "orange";
  delay?: number;
}

const NoteCard = ({
  title,
  description,
  tags,
  date,
  accentColor = "cyan",
  delay = 0,
}: NoteCardProps) => {
  const accentColors = {
    cyan: "bg-primary",
    purple: "bg-accent",
    green: "bg-emerald-500",
    orange: "bg-orange-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-xl p-5 card-glow cursor-pointer"
    >
      {/* Accent bar */}
      <div className={`w-1 h-8 ${accentColors[accentColor]} rounded-full mb-4`} />

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="w-3.5 h-3.5" />
        {date}
      </div>
    </motion.div>
  );
};

export default NoteCard;
