import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/shared/hooks/useSocket';
import { taskKeys } from '@/entities/task/api/useTasks';

export function useTaskSocketEvents(projectId?: string) {
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket || !projectId) return;

        // Join project room
        socket.emit('join:project', projectId);

        const handleTaskUpdated = (updatedTask: any) => {
            // Update cache for this task
             queryClient.setQueryData(taskKeys.project(projectId), (oldTasks: any[]) => {
                if (!oldTasks) return oldTasks;
                return oldTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
             });
             
             // Invalidate to be safe (fetch fresh comments etc if needed)
             queryClient.invalidateQueries({ queryKey: taskKeys.detail(updatedTask.id) });
        };

        const handleTaskCreated = (newTask: any) => {
             queryClient.setQueryData(taskKeys.project(projectId), (oldTasks: any[]) => {
                 if (!oldTasks) return [newTask];
                 // Check duplicate
                 if (oldTasks.find(t => t.id === newTask.id)) return oldTasks;
                 return [...oldTasks, newTask];
             });
        };

        socket.on('task:updated', handleTaskUpdated);
        socket.on('task:created', handleTaskCreated); // If we emit this from backend
        // socket.on('tasks:bulk_updated', ...)

        return () => {
             socket.emit('leave:project', projectId);
             socket.off('task:updated', handleTaskUpdated);
             socket.off('task:created', handleTaskCreated);
        };
    }, [socket, projectId, queryClient]);
}
