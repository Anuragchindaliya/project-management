
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from './notification.api';

export const notificationKeys = {
    all: ['notifications'] as const,
    list: () => [...notificationKeys.all, 'list'] as const,
};

export function useNotifications() {
    return useQuery({
        queryKey: notificationKeys.list(),
        queryFn: async () => {
            const res = await notificationApi.getNotifications();
            if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch notifications');
            return res.data;
        },
        refetchInterval: 30000, // Poll every 30s
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
        },
    });
}
