import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, CreateTaskDTO, UpdateTaskDTO } from './task.api';
import { Task } from '@/shared/types/drizzle.types';

export const taskKeys = {
  all: ['tasks'] as const,
  project: (projectId: string) => [...taskKeys.all, 'project', projectId] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.project(projectId),
    queryFn: () => taskApi.getProjectTasks(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDTO) => taskApi.createTask(projectId, data),
    onSuccess: (newTask) => {
      queryClient.setQueryData(taskKeys.project(projectId), (oldData: Task[] | undefined) => {
        return oldData ? [...oldData, newTask] : [newTask];
      });
      // Also invalidate to be safe
      queryClient.invalidateQueries({ queryKey: taskKeys.project(projectId) });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskDTO }) => 
        taskApi.updateTask(taskId, data),
    
    // Optimistic Update
    onMutate: async ({ taskId, data }) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.project(projectId) });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.project(projectId));

      // Optimistically update
      if (previousTasks) {
          queryClient.setQueryData<Task[]>(taskKeys.project(projectId), (old) => {
              if (!old) return [];
              return old.map(task => 
                  task.id === taskId ? { 
                      ...task, 
                      ...data,
                       // Ensure dates are compatible if present in data
                       dueDate: data.dueDate ? new Date(data.dueDate) : task.dueDate,
                       // completedAt handling if applicable
                  } : task
              );
          });
      }

      return { previousTasks };
    },
    
    onError: (_err, _newTodo, context) => {
      // Rollback on error
      if (context?.previousTasks) {
          queryClient.setQueryData(taskKeys.project(projectId), context.previousTasks);
      }
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.project(projectId) });
    },
  });
}
