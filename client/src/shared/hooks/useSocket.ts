/**
 * Socket.io hook for real-time updates
 * Listens for events and invalidates TanStack Query cache
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

// Socket events that should trigger query invalidation
const INVALIDATION_EVENTS = {
  project: {
    created: ['projects'],
    updated: ['projects', 'project'],
    deleted: ['projects'],
  },
  task: {
    created: ['tasks', 'project'],
    updated: ['tasks', 'task', 'project'],
    deleted: ['tasks', 'project'],
  },
  workspace: {
    created: ['workspaces'],
    updated: ['workspaces', 'workspace'],
    deleted: ['workspaces'],
  },
} as const;

export function useSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Connect to socket.io server
    const socket: Socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      withCredentials: true,
    });

    // Listen for project events
    socket.on('project:created', () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    socket.on('project:updated', (data: { projectId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', data.projectId] });
      }
    });

    socket.on('project:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    // Listen for task events
    socket.on('task:created', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    socket.on('task:updated', (data: { taskId?: string; projectId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.taskId) {
        queryClient.invalidateQueries({ queryKey: ['task', data.taskId] });
      }
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', data.projectId] });
      }
    });

    socket.on('task:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    // Listen for workspace events
    socket.on('workspace:created', () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    });

    socket.on('workspace:updated', (data: { workspaceId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      if (data.workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['workspace', data.workspaceId] });
      }
    });

    socket.on('workspace:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}
