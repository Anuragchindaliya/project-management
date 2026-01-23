/**
 * Type-safe Projects API service
 * Uses shared Drizzle types for 100% type safety
 */

import apiClient, { type ApiResponse } from '@/shared/api/client';
import type { Project } from '@/shared/types/drizzle.types';

// Project-specific DTOs (for create/update operations)
export interface CreateProjectDTO {
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {
  status?: 'active' | 'archived' | 'completed';
}

// Project API endpoints
export const projectApi = {
  /**
   * Get all projects for a workspace
   */
  getWorkspaceProjects: async (workspaceId: string): Promise<Project[]> => {
    const response = await apiClient.get<ApiResponse<{ projects: Project[] }>>(
      `/projects/workspace/${workspaceId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch projects');
    }
    return response.data.data.projects;
  },

  /**
   * Get a single project by ID
   */
  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<{ project: Project }>>(
      `/projects/${projectId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch project');
    }
    return response.data.data.project;
  },

  /**
   * Create a new project
   */
  createProject: async (data: CreateProjectDTO): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<{ project: Project }>>(
      '/projects',
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create project');
    }
    return response.data.data.project;
  },

  /**
   * Update an existing project
   */
  updateProject: async (projectId: string, data: UpdateProjectDTO): Promise<Project> => {
    const response = await apiClient.patch<ApiResponse<{ project: Project }>>(
      `/projects/${projectId}`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update project');
    }
    return response.data.data.project;
  },

  /**
   * Delete a project
   */
  deleteProject: async (projectId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<never>>(`/projects/${projectId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete project');
    }
  },

  /**
   * Get project members
   */
  getProjectMembers: async (projectId: string) => {
    const response = await apiClient.get<ApiResponse<{ members: Array<{ member: any; user: any }> }>>(
      `/projects/${projectId}/members`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch project members');
    }
    return response.data.data.members;
  },

  /**
   * Add a member to a project
   */
  addProjectMember: async (
    projectId: string,
    data: { userId: string; role: 'lead' | 'developer' | 'viewer' }
  ): Promise<void> => {
    const response = await apiClient.post<ApiResponse<never>>(
      `/projects/${projectId}/members`,
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to add project member');
    }
  },

  /**
   * Update a project member's role
   */
  updateProjectMemberRole: async (
    projectId: string,
    userId: string,
    role: 'lead' | 'developer' | 'viewer'
  ): Promise<void> => {
    const response = await apiClient.patch<ApiResponse<never>>(
      `/projects/${projectId}/members/${userId}`,
      { role }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update project member role');
    }
  },

  /**
   * Remove a member from a project
   */
  removeProjectMember: async (projectId: string, userId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<never>>(
      `/projects/${projectId}/members/${userId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to remove project member');
    }
  },
};
