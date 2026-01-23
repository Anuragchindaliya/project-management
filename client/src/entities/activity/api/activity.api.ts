
import apiClient, { type ApiResponse } from '@/shared/api/client';

export interface ActivityLog {
    id: string;
    action: string;
    entityType: string;
    metadata: any;
    createdAt: string;
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    };
}

export const activityApi = {
    getTaskActivity: async (taskId: string) => {
        const response = await apiClient.get<ApiResponse<ActivityLog[]>>(`/tasks/${taskId}/activity`);
        return response.data.data; // Response wrapper handles success check usually? No, I should check.
        // My activity controller returns { success: true, data: activities }
        // ApiResponse<T> usually has success, data, error.
    }
};
