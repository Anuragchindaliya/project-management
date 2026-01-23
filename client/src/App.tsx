import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider, useAuth } from './app/providers/AuthProvider';
import { ThemeProvider } from './features/theme/ThemeProvider';
import { useSocket } from './shared/hooks/useSocket';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DashboardLayout } from './_layouts/DashboardLayout';
import { ProjectsPage } from './pages/projects/ProjectsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  useSocket();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        element={
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Placeholders and new routes */}
        <Route path="/workspaces" element={<div className="p-4">Workspaces Content</div>} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<div className="p-4">Tasks Content</div>} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}

export default App;
