import apiClient from './client';
import { ApiResponse } from './client';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  workspaceMemberships?: {
    workspaceId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  }[];
}
export interface MeResponse {
  user: User;
}

export interface LoginResponse {
  user: User;
  token?: string; // If using JWT in body, though cookie is preferred
}

export const authApi = {
  register: async (data: any): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  me: async (): Promise<ApiResponse<MeResponse>> => {
    const response = await apiClient.get<ApiResponse<MeResponse>>('/auth/me');
    return response.data;
  },
};
