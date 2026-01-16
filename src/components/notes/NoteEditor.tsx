import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Save, Trash2, Plus } from "lucide-react";
import type { Note } from "@/types/models";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note;
  onSave?: (input: { id?: string; title: string; content: string; tags: string[] }) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

const NoteEditor = ({ isOpen, onClose, note, onSave, onDelete }: NoteEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setTags(note?.tags ?? []);
    setNewTag("");
  }, [note, isOpen]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    try {
      await onSave?.({ id: note?.id, title, content, tags });
      onClose();
    } catch {
      // Keep editor open on failure.
    }
  };

  const handleDelete = async () => {
    try {
      if (note?.id) {
        await onDelete?.(note.id);
        onClose();
      }
    } catch {
      // Keep editor open on failure.
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-3 px-4 sm:px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  {note ? "Edit Note" : "New Note"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Title and Tags Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title..."
                      className="bg-secondary border-border text-lg h-12"
                    />
                  </div>
                  <div className="md:w-80">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add tag..."
                        className="bg-secondary border-border h-12"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAddTag}
                        className="h-12 w-12 border-border"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tags Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1 bg-primary/20 text-primary border-0 cursor-pointer hover:bg-primary/30"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Content Area */}
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Content
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note content here..."
                    className="bg-secondary border-border min-h-[400px] md:min-h-[500px] resize-none text-base leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoteEditor;
