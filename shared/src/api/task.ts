import apiClient from './client';
import { ApiResponse } from './client';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  taskNumber: number;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string | null;
  reporterId: string;
  parentTaskId: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDTO {
  projectId: string;
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assigneeId?: string;
  dueDate?: string;
}
type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export type TaskWithAssignee = {
  task: Task;
  assignee: User | null;
}
const data = {
    "tasks": [
        {
            "task": {
                "id": "25429d9a-aa75-4565-9bbc-4d396a168e49",
                "projectId": "9f028316-e867-4cf0-8576-4eca59d6680f",
                "title": "Get Ready Design on Figma",
                "description": "Make Figma design of competency project ",
                "taskNumber": 2,
                "status": "in_review",
                "priority": "medium",
                "assigneeId": null,
                "reporterId": "e15e95ee-55dc-4eeb-a110-16db740abd39",
                "parentTaskId": null,
                "estimatedHours": null,
                "actualHours": null,
                "dueDate": null,
                "completedAt": null,
                "createdAt": "2026-01-23T14:10:17.000Z",
                "updatedAt": "2026-01-23T15:55:37.000Z"
            },
            "assignee": null
        },
        {
            "task": {
                "id": "29dda509-d53c-4d23-a224-270b188d887d",
                "projectId": "9f028316-e867-4cf0-8576-4eca59d6680f",
                "title": "Initial setup",
                "description": "Make the initial setup with necessary dependencies",
                "taskNumber": 1,
                "status": "todo",
                "priority": "medium",
                "assigneeId": "ddc271c8-82df-4f78-82c5-c64d24516043",
                "reporterId": "e15e95ee-55dc-4eeb-a110-16db740abd39",
                "parentTaskId": null,
                "estimatedHours": null,
                "actualHours": null,
                "dueDate": null,
                "completedAt": null,
                "createdAt": "2026-01-23T13:52:36.000Z",
                "updatedAt": "2026-02-12T19:00:04.000Z"
            },
            "assignee": {
                "id": "ddc271c8-82df-4f78-82c5-c64d24516043",
                "username": "johndoe",
                "firstName": "John",
                "lastName": "Doe",
                "avatarUrl": null
            }
        }
    ],
    "count": 2
}

export interface ProjectTasksResponse {
  tasks: TaskWithAssignee[];
  count: number;
}

export const taskApi = {
  getProjectTasks: async (projectId: string): Promise<ApiResponse<ProjectTasksResponse>> => {
    const response = await apiClient.get<ApiResponse<ProjectTasksResponse>>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  getTaskById: async (taskId: string): Promise<ApiResponse<Task>> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (projectId: string, data: CreateTaskDTO): Promise<ApiResponse<Task>> => {
    const response = await apiClient.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  updateTask: async (taskId: string, data: Partial<CreateTaskDTO>): Promise<ApiResponse<Task>> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}`, data);
    return response.data;
  },

  bulkUpdateTasks: async (data: { tasks: { id: string; status?: string; order?: number }[] }): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>('/tasks/bulk-update', data);
    return response.data;
  },
};
