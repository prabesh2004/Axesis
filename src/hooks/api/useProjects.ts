import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/types/models";
import * as projectsService from "@/services/projects";

const keys = {
  all: ["projects"] as const,
};

export function useProjectsQuery() {
  return useQuery({
    queryKey: keys.all,
    queryFn: projectsService.listProjects,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Project, "id" | "createdAt" | "updatedAt">) => projectsService.createProject(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">> }) =>
      projectsService.updateProject(id, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}
