/**
 * TanStack Query hooks for Projects
 * Example usage of the type-safe Projects API service
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, type CreateProjectDTO, type UpdateProjectDTO } from './project.api';
import type { Project } from '@/shared/types/drizzle.types';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (workspaceId: string) => [...projectKeys.lists(), workspaceId] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  members: (projectId: string) => [...projectKeys.detail(projectId), 'members'] as const,
};

/**
 * Hook to fetch all projects for a workspace
 */
export function useWorkspaceProjects(workspaceId: string) {
  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: () => projectApi.getWorkspaceProjects(workspaceId),
    enabled: !!workspaceId,
  });
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectApi.getProjectById(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) => projectApi.createProject(data),
    onSuccess: (_newProject: Project) => {
      // Invalidate and refetch workspace projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Optionally set the new project as active
      // useUIStore.getState().setActiveProjectId(newProject.id);
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectDTO }) =>
      projectApi.updateProject(projectId, data),
    onSuccess: (updatedProject: Project) => {
      // Invalidate project detail and lists
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(updatedProject.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to fetch project members
 */
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () => projectApi.getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to add a project member
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      role,
    }: {
      projectId: string;
      userId: string;
      role: 'lead' | 'developer' | 'viewer';
    }) => projectApi.addProjectMember(projectId, { userId, role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.projectId) });
    },
  });
}

/**
 * Hook to update a project member's role
 */
export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      role,
    }: {
      projectId: string;
      userId: string;
      role: 'lead' | 'developer' | 'viewer';
    }) => projectApi.updateProjectMemberRole(projectId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.projectId) });
    },
  });
}

/**
 * Hook to remove a project member
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectApi.removeProjectMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.projectId) });
    },
  });
}
