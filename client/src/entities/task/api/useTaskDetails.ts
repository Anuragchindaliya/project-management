import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskKeys } from './useTasks';
import apiClient, { ApiResponse } from '@/shared/api/client';
import { TaskComment } from '@/shared/types/drizzle.types';

// Extended Task API for Details and Comments
const taskDetailApi = {
    getTaskDetails: async (taskId: string) => {
        const response = await apiClient.get<ApiResponse<{ task: any }>>(`/tasks/tasks/${taskId}`);
        if (!response.data.success || !response.data.data) {
             throw new Error(response.data.error || 'Failed to fetch task details');
        }
        return response.data.data.task;
    },
    
    getComments: async (_taskId: string) => {
         // Assuming endpoint exists or we fetch with details. 
         // For now let's mock or assume separate endpoint if needed, 
         // but normally details include comments.
         // Let's create a specific comment fetching if needed, but `getTaskDetails` should return it.
         return [];
    },

    addComment: async (taskId: string, content: string) => {
        // We need a comment endpoint. Let's assume one exists or create it.
        // POST /tasks/:taskId/comments
        const response = await apiClient.post<ApiResponse<{ comment: TaskComment }>>(`/tasks/${taskId}/comments`, { content });
        if (!response.data.success || !response.data.data) {
             throw new Error(response.data.error || 'Failed to add comment');
        }
        return response.data.data.comment;
    }
};

export function useTaskDetails(taskId: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(taskId!),
    queryFn: () => taskDetailApi.getTaskDetails(taskId!),
    enabled: !!taskId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) => 
      taskDetailApi.addComment(taskId, content),
    onSuccess: (_newComment, variables) => {
      // Invalidate task details to show new comment
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
    },
  });
}
