import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskKeys } from './useTasks';
import apiClient, { ApiResponse } from '@/shared/api/client';
import { TaskComment } from '@/shared/types/drizzle.types';

type CommentWithUserType = {
    comment: {
        id: string;
        taskId: string;
        userId: string;
        content: string;
        createdAt: string;
        updatedAt: string;
    };
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: null;
    };
}
type AssigneeType = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
}
type TaskResponse = {
    id: string;
    projectId: string;
    title: string;
    description: string;
    taskNumber: number;
    status: string;
    priority: string;
    assigneeId: null;
    reporterId: string;
    parentTaskId: null;
    estimatedHours: null;
    actualHours: null;
    dueDate: null;
    completedAt: null;
    createdAt: string;
    updatedAt: string;
    project: {
        id: string;
        workspaceId: string;
        name: string;
        key: string;
        description: string;
        ownerId: string;
        status: string;
        startDate: null;
        endDate: null;
        createdAt: string;
        updatedAt: string;
    };
    assignee: AssigneeType;
    reporter: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: null;
    };
    comments: CommentWithUserType[];
    attachments: never[];
    subtasks: never[];
};
// Extended Task API for Details and Comments
const taskDetailApi = {
    getTaskDetails: async (taskId: string) => {
        const response = await apiClient.get<ApiResponse<TaskResponse>>(`/tasks/${taskId}`);
        if (!response.data.success || !response.data.data) {
             throw new Error(response.data.error || 'Failed to fetch task details');
        }
        return response.data.data;
    },
    
    addComment: async (taskId: string, content: string) => {
        const response = await apiClient.post<ApiResponse<{ comment: TaskComment }>>(`/tasks/${taskId}/comments`, { content });
        if (!response.data.success || !response.data.data) {
             throw new Error(response.data.error || 'Failed to add comment');
        }
        return response.data.data.comment;
    },

    assignTask: async (taskId: string, assigneeId: string) => {
        const response = await apiClient.patch<ApiResponse<{ task: any }>>(`/tasks/${taskId}/assign`, { assigneeId });
        if (!response.data.success || !response.data.data) {
             throw new Error(response.data.error || 'Failed to assign task');
        }
        return response.data.data.task;
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

export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, assigneeId }: { taskId: string; assigneeId: string }) => 
      taskDetailApi.assignTask(taskId, assigneeId),
    onSuccess: (_updatedTask, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.project(_updatedTask.projectId) });
    },
  });
}
