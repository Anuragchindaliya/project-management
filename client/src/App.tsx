import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider, useAuth } from './app/providers/AuthProvider';
import { ThemeProvider } from './features/theme/ThemeProvider';
import { useSocket } from './shared/hooks/useSocket';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DashboardLayout } from './_layouts/DashboardLayout';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { InboxPage } from './pages/inbox/InboxPage';
import { WorkspaceProjectsPage } from './pages/workspaces/WorkspaceProjectsPage';
import { LandingPage } from './pages/landing/LandingPage';
// ... (omitting imports for brevity if possible, or just replacing imports block?)
// I need to add import at top and replace route at bottom.
// I will do two chunks or use multi_replace. Or replace entire content if small enough? 90 lines.
// I'll stick to replace_file_content for imports FIRST using Context? No, "Instruction" handles logic but here I should provide exact Replacement.
// I'll use multi_replace or carefully crafted replace.
// Let's use multi_replace to be safe with multiple edits.

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

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
         return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

function AppContent() {
  useSocket();

  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      <Route 
        element={
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Workspace Routes */}
        <Route path="/workspaces/:workspaceId" element={<WorkspaceProjectsPage />} />
        
        {/* Global/All Projects and Tasks */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectsPage />} /> 

        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/inbox" element={<InboxPage />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
