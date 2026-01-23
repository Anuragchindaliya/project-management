import apiClient, { type ApiResponse } from '@/shared/api/client';
import type { Task, TaskResponse } from '@/shared/types/drizzle.types';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  dueDate?: string; // ISO
  assigneeId?: string;
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
    status?: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
}

export const taskApi = {
  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get<ApiResponse<{ tasks: TaskResponse[] }>>(
      `/projects/${projectId}/tasks`
    );
     if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch tasks');
    }
    return response.data.data.tasks.map(t => ({
        ...t.task,
        assignee: t.assignee || undefined
    }));
  },

  createTask: async (projectId: string, data: CreateTaskDTO): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<{ task: Task }>>(
      `/projects/${projectId}/tasks`,
      data
    );
     if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create task');
    }
    return response.data.data.task;
  },

  updateTask: async (taskId: string, data: UpdateTaskDTO): Promise<Task> => {
      const response = await apiClient.patch<ApiResponse<{ task: Task }>>(`/tasks/${taskId}`, data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to update task');
    }
    return response.data.data.task;
  },

  deleteTask: async (taskId: string): Promise<void> => {
      const response = await apiClient.delete<ApiResponse<never>>(`/tasks/${taskId}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete task');
    }
  }
};
