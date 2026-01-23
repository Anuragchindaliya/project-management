import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceStore {
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string | null) => void;
  clearActiveWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
      clearActiveWorkspace: () => set({ activeWorkspaceId: null }),
    }),
    {
      name: 'workspace-storage', // unique name
    }
  )
);
