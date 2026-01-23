import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi, CreateWorkspaceDTO } from './workspace.api';
import apiClient from '@/shared/api/client';

export const workspaceKeys = {
  all: ['workspaces'] as const,
  user: () => [...workspaceKeys.all, 'user'] as const,
  detail: (id: string) => [...workspaceKeys.all, 'detail', id] as const,
};

export function useUserWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.user(),
    queryFn: workspaceApi.getUserWorkspaces,
  });
}

export function useWorkspaceById(workspaceId: string) {
    return useQuery({
        queryKey: workspaceKeys.detail(workspaceId),
        queryFn: () => workspaceApi.getWorkspaceById(workspaceId),
        enabled: !!workspaceId,
    });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDTO) => workspaceApi.createWorkspace(data),
    onSuccess: (newWorkspace) => {
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: workspaceKeys.user() });
      
      // Optionally set cache for detail immediately
      queryClient.setQueryData(workspaceKeys.detail(newWorkspace.id), newWorkspace);
    },
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: [...workspaceKeys.detail(workspaceId), 'members'],
    queryFn: () => workspaceApi.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, email, role }: { workspaceId: string; email: string; role: 'admin' | 'member' | 'viewer' }) =>
      apiClient.post(`/workspaces/${workspaceId}/members/invite`, { email, role }).then(res => res.data.data),
    onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [...workspaceKeys.detail(variables.workspaceId), 'members'] });
    }
  });
}
