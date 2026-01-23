import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { useAuthStore } from '@/shared/store/auth.store';
import { authApi, User } from '@/shared/api/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, setUser, clearUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.me();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          clearUser();
        }
      } catch (error) {
        clearUser();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, clearUser]);

  const login = async (email: string, pass: string) => {
    try {
      const response = await authApi.login(email, pass);
      if (response.success && response.data) {
        // The API returns { user, token }. We need to extract user.
        // authApi.login returns ApiResponse<LoginResponse>.
        // LoginResponse has { user: User }.
        setUser(response.data.user);
        toast.success('Logged in successfully');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
       console.error(error);
       throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      clearUser();
      toast.success('Logged out');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
