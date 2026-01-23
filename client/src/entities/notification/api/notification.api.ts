
import apiClient, { type ApiResponse } from '@/shared/api/client';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
    user?: any; // Relations
    // ...
}

export const notificationApi = {
    getNotifications: async () => {
        const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
        return response.data;
    },
    
    markAsRead: async (id: string) => {
        const response = await apiClient.patch<ApiResponse<{ id: string }>>(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await apiClient.patch<ApiResponse<null>>('/notifications/read-all');
        return response.data;
    }
};
