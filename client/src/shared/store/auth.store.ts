/**
 * Zustand store for authentication state
 * This is for local UI state, not server state
 */

import { create } from 'zustand';

interface AuthState {
  user: {
    userId: string;
    email: string;
    username: string;
  } | null;
  isAuthenticated: boolean;
  setUser: (user: AuthState['user']) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
