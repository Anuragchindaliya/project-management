import apiClient from './client';
import { ApiResponse } from './client';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  avatarUrl: string | null;
  isActive: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceListResponse {
  workspaces: { workspace: Workspace, role: string }[];
}

export const workspaceApi = {
  getUserWorkspaces: async (): Promise<ApiResponse<WorkspaceListResponse>> => {
    const response = await apiClient.get<ApiResponse<WorkspaceListResponse>>('/workspaces');
    return response.data;
  },

  getWorkspaceById: async (workspaceId: string): Promise<ApiResponse<{ workspace: Workspace }>> => {
    const response = await apiClient.get<ApiResponse<{ workspace: Workspace }>>(`/workspaces/${workspaceId}`);
    return response.data;
  },

  createWorkspace: async (data: { name: string; description?: string }): Promise<ApiResponse<{ workspace: Workspace }>> => {
    const response = await apiClient.post<ApiResponse<{ workspace: Workspace }>>('/workspaces', data);
    return response.data;
  },
};
