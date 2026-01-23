import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { dashboardApi, DashboardStats } from '@/shared/api/dashboard';
import { AnalyticsWidgets } from './components/AnalyticsWidgets';
import { EmptyState } from './components/EmptyState';
import { Loader2 } from 'lucide-react';


export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await dashboardApi.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if we have any data
  const hasData = stats?.hasData;

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || user?.username || 'User'}. Here's an overview of your projects.
        </p>
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          <AnalyticsWidgets data={stats} />
          
          {/* We could add more sections here like "Recent Projects" or "My Tasks" */}
          {/* For now keeping it simple as per request to focus on analysis and empty state */}
        </div>
      )}
    </div>
  );
}
