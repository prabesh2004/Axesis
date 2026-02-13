import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/types/models";
import * as projectsService from "@/services/projects";
import { getCurrentUserId } from "@/services/authIdentity";

const keys = {
  all: (userId: string | null) => ["projects", userId ?? "anon"] as const,
};

export function useProjectsQuery() {
  const userId = getCurrentUserId();
  return useQuery({
    queryKey: keys.all(userId),
    queryFn: projectsService.listProjects,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Project, "id" | "createdAt" | "updatedAt">) => projectsService.createProject(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all(getCurrentUserId()) });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">> }) =>
      projectsService.updateProject(id, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all(getCurrentUserId()) });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all(getCurrentUserId()) });
    },
  });
}
