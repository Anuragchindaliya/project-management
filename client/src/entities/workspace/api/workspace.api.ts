import apiClient, { type ApiResponse } from '@/shared/api/client';
import type { Workspace, WorkspaceMemberWithUserResponse, WorkspaceWithRole } from '@/shared/types/drizzle.types';

export interface CreateWorkspaceDTO {
  name: string;
  slug: string;
  description?: string;
}


export const workspaceApi = {
  getUserWorkspaces: async (): Promise<WorkspaceWithRole[]> => {
    const response = await apiClient.get<ApiResponse<{ workspaces: WorkspaceWithRole[] }>>('/workspaces');
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch workspaces');
    }
    return response.data.data.workspaces;
  },

  createWorkspace: async (data: CreateWorkspaceDTO): Promise<Workspace> => {
     const response = await apiClient.post<ApiResponse<{ workspace: Workspace }>>('/workspaces', data);
     if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create workspace');
    }
    return response.data.data.workspace;
  },

  getWorkspaceById: async (workspaceId: string): Promise<Workspace> => {
    const response = await apiClient.get<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${workspaceId}`);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch workspace');
    }
    return response.data.data.workspace;
  },

  getWorkspaceMembers: async (workspaceId: string): Promise<WorkspaceMemberWithUserResponse[]> => {
      const response = await apiClient.get<ApiResponse<{ members: WorkspaceMemberWithUserResponse[] }>>(`/workspaces/${workspaceId}/members`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch workspace members');
    }
    return response.data.data.members;
  },

  updateWorkspaceMemberRole: async (workspaceId: string, userId: string, role: 'admin' | 'member' | 'viewer') => {
      const response = await apiClient.put(`/workspaces/${workspaceId}/members/${userId}`, { role });
      return response.data;
  },
  
  removeWorkspaceMember: async (workspaceId: string, userId: string) => {
      const response = await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
      return response.data;
  },
  
  // Method to check permissions helper (optional, logic usually in hooks)
};
