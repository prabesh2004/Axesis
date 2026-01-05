import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NoteCard from "@/components/cards/NoteCard";
import NoteEditor from "@/components/notes/NoteEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";

const notes = [
  {
    title: "React Hooks Deep Dive",
    description:
      "Understanding useState, useEffect, useCallback, and useMemo for optimal performance...",
    tags: ["React", "Performance"],
    date: "Jan 3, 2024",
    accentColor: "cyan" as const,
  },
  {
    title: "MongoDB Aggregation Pipeline",
    description:
      "Notes on $match, $group, $project, and other aggregation operators...",
    tags: ["MongoDB", "Database"],
    date: "Jan 2, 2024",
    accentColor: "purple" as const,
  },
  {
    title: "System Design Patterns",
    description:
      "Key patterns for building scalable systems: load balancing, caching, sharding...",
    tags: ["System Design", "Architecture"],
    date: "Dec 28, 2023",
    accentColor: "cyan" as const,
  },
  {
    title: "TypeScript Best Practices",
    description:
      "Type inference, generics, utility types, and advanced patterns...",
    tags: ["TypeScript", "Best Practices"],
    date: "Dec 25, 2023",
    accentColor: "purple" as const,
  },
  {
    title: "AWS Lambda Functions",
    description:
      "Serverless architecture, cold starts, and optimization strategies...",
    tags: ["AWS", "Serverless"],
    date: "Dec 20, 2023",
    accentColor: "cyan" as const,
  },
  {
    title: "GraphQL vs REST",
    description:
      "Comparing API architectures, when to use each, and migration strategies...",
    tags: ["API", "GraphQL"],
    date: "Dec 18, 2023",
    accentColor: "purple" as const,
  },
];

const Notes = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <DashboardLayout
      title="Notes"
      subtitle="Organize your knowledge and learning materials."
    >
      {/* Search and Actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsEditorOpen(true)}
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Notes Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {notes.map((note, index) => (
          <NoteCard key={note.title} {...note} delay={index * 0.1} />
        ))}
      </motion.div>

      {/* Note Editor Modal */}
      <NoteEditor isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
    </DashboardLayout>
  );
};

export default Notes;
