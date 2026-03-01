import apiClient from './client';
import { ApiResponse } from './client';
import { Workspace } from './workspace';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string | null;
  ownerId: string;
  status: 'active' | 'archived' | 'completed';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceProject {
    workspaceId: string;
    name: string;
    key: string;
    description?: string;
}

export interface WorkspaceProjectsResponse {
    projects: Project[];
}

export const projectApi = {
  getWorkspaceProjects: async (workspaceId: string): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>(`/projects/workspace/${workspaceId}`);
    return response.data;
  },

  getProjectPermissions: async (projectId: string): Promise<ApiResponse<{ permissions: any }>> => {
    const response = await apiClient.get<ApiResponse<{ permissions: any }>>(`/projects/${projectId}/permissions`);
    return response.data;
  },

  getProjectById: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`);
    return response.data;
  },

  createProject: async (data: WorkspaceProject): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data;
  },
};
