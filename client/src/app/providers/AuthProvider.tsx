/**
 * Auth Provider for managing authentication state
 * This can be extended to fetch user data on mount
 */

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/shared/store/auth.store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // TODO: Add logic to fetch current user on mount
  // For now, this is a placeholder that can be extended
  
  useEffect(() => {
    // Example: Fetch current user
    // const fetchUser = async () => {
    //   try {
    //     const user = await authApi.getCurrentUser();
    //     useAuthStore.getState().setUser(user);
    //   } catch (error) {
    //     // User not authenticated
    //     useAuthStore.getState().clearUser();
    //   }
    // };
    // fetchUser();
  }, []);

  return <>{children}</>;
}
