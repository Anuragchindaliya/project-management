
import { useQuery } from '@tanstack/react-query';
import { activityApi } from './activity.api';

export const activityKeys = {
    all: ['activity'] as const,
    task: (taskId: string) => [...activityKeys.all, 'task', taskId] as const,
};

export function useTaskActivity(taskId: string) {
    return useQuery({
        queryKey: activityKeys.task(taskId),
        queryFn: () => activityApi.getTaskActivity(taskId),
        enabled: !!taskId,
    });
}
