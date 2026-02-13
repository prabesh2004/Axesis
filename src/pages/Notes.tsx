import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NoteCard from "@/components/cards/NoteCard";
import NoteEditor from "@/components/notes/NoteEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Search, Filter, Plus } from "lucide-react";
import type { Note, NoteAccentColor } from "@/types/models";
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useNotesQuery,
  useUpdateNoteMutation,
} from "@/hooks/api/useNotes";

function formatNoteDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function noteDescription(content: string): string {
  const firstLine = content.split("\n").find((l) => l.trim().length > 0) ?? "";
  return firstLine.length > 0 ? firstLine : "(No content)";
}

function pickAccentColor(id: string): NoteAccentColor {
  const colors: NoteAccentColor[] = ["cyan", "purple"];
  let acc = 0;
  for (let i = 0; i < id.length; i++) acc = (acc + id.charCodeAt(i)) % 997;
  return colors[acc % colors.length];
}

const Notes = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => new Set());

  const notesQuery = useNotesQuery();
  const createNote = useCreateNoteMutation();
  const updateNote = useUpdateNoteMutation();
  const deleteNote = useDeleteNoteMutation();

  const notes = useMemo(() => notesQuery.data ?? [], [notesQuery.data]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) {
      for (const t of n.tags ?? []) {
        const key = t.trim();
        if (key) set.add(key);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((n) => {
      if (selectedTags.size) {
        const hasAny = (n.tags ?? []).some((t) => selectedTags.has(t));
        if (!hasAny) return false;
      }

      if (!q) return true;
      const hay = `${n.title}\n${n.content}\n${(n.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notes, search, selectedTags]);

  const clearFilters = () => {
    setSelectedTags(new Set());
  };

  const toggleTag = (tag: string, checked: boolean) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (checked) next.add(tag);
      else next.delete(tag);
      return next;
    });
  };

  const handleNewNote = () => {
    setEditingNote(undefined);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleSave = async (input: { id?: string; title: string; content: string; tags: string[] }) => {
    try {
      if (input.id) {
        await updateNote.mutateAsync({ id: input.id, patch: { title: input.title, content: input.content, tags: input.tags } });
        toast.success("Note updated");
      } else {
        await createNote.mutateAsync({ title: input.title, content: input.content, tags: input.tags });
        toast.success("Note created");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save note";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote.mutateAsync(id);
      toast.success("Note deleted");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete note";
      toast.error(message);
    }
  };

  return (
    <DashboardLayout
      title="Notes"
      subtitle="Organize your knowledge and learning materials."
    >
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
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
            <PopoverContent align="end" className="w-80">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-sm font-medium">Filter notes</p>
                <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!selectedTags.size}>
                  Clear
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
                {availableTags.length ? (
                  <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
                    {availableTags.map((tag) => {
                      const id = `notes-tag-${tag}`;
                      const checked = selectedTags.has(tag);
                      return (
                        <div key={tag} className="flex items-center gap-2">
                          <Checkbox
                            id={id}
                            checked={checked}
                            onCheckedChange={(v) => toggleTag(tag, Boolean(v))}
                          />
                          <Label htmlFor={id} className="text-sm text-foreground">
                            {tag}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags yet.</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none"
            onClick={handleNewNote}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Note</span>
          </Button>
        </div>
      </div>

      {/* Notes Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredNotes.length ? (
          filteredNotes.map((note, index) => (
            <NoteCard
              key={note.id}
              title={note.title}
              description={noteDescription(note.content)}
              tags={note.tags}
              date={formatNoteDate(note.updatedAt)}
              accentColor={pickAccentColor(note.id)}
              delay={index * 0.1}
              onEdit={() => handleEditNote(note)}
              onDelete={() => void handleDelete(note.id)}
            />
          ))
        ) : (
          <div className="col-span-full">
            <p className="text-sm text-muted-foreground">
              No notes found. Try clearing filters or changing your search.
            </p>
          </div>
        )}
      </motion.div>

      {/* Note Editor Modal */}
      <NoteEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        note={editingNote}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default Notes;
