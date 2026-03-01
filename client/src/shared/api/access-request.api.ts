import apiClient, { type ApiResponse } from './client';

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
  createRequest: async (data: CreateAccessRequestDTO): Promise<AccessRequest> => {
    const response = await apiClient.post<ApiResponse<{ request: AccessRequest }>>('/access-requests', data);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create request');
    }
    return response.data.data.request;
  },

  getPendingRequests: async () => {
    const response = await apiClient.get<ApiResponse<{ requests: any[] }>>('/access-requests/pending');
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch requests');
    }
    return response.data.data.requests;
  },

  respondToRequest: async (requestId: string, status: 'approved' | 'rejected') => {
    const response = await apiClient.patch<ApiResponse<void>>(`/access-requests/${requestId}/respond`, { status });
    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to respond to request');
    }
    return response.data;
  },
};
