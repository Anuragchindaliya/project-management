import apiClient, { ApiResponse } from './client';

export interface AccessRequest {
  id: string;
  userId: string;
  projectId: string | null;
  workspaceId: string;
  requestedRole: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccessRequestDTO {
  workspaceId: string;
  projectId?: string;
  requestedRole: string;
  message?: string;
}

export const accessRequestApi = {
  createRequest: async (data: CreateAccessRequestDTO): Promise<ApiResponse<AccessRequest>> => {
    const response = await apiClient.post<ApiResponse<AccessRequest>>('/access-requests', data);
    return response.data;
  },

  getPendingRequests: async (): Promise<ApiResponse<{ requests: any[] }>> => {
    const response = await apiClient.get<ApiResponse<{ requests: any[] }>>('/access-requests/pending');
    return response.data;
  },

  respondToRequest: async (requestId: string, status: 'approved' | 'rejected'): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>(`/access-requests/${requestId}/respond`, { status });
    return response.data;
  },
};
