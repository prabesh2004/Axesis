import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/types/models";
import * as notesService from "@/services/notes";

const keys = {
  all: ["notes"] as const,
};

export function useNotesQuery() {
  return useQuery({
    queryKey: keys.all,
    queryFn: notesService.listNotes,
  });
}

export function useCreateNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Pick<Note, "title" | "content" | "tags">) => notesService.createNote(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<Note, "title" | "content" | "tags">> }) =>
      notesService.updateNote(id, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}
