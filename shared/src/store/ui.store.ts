/**
 * Zustand store for UI state (sidebar, active project, etc.)
 */

import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeProjectId: string | null;
  activeWorkspaceId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveProjectId: (projectId: string | null) => void;
  setActiveWorkspaceId: (workspaceId: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeProjectId: null,
  activeWorkspaceId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
  setActiveWorkspaceId: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
}));
