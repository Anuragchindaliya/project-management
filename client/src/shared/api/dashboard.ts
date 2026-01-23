import apiClient, { ApiResponse } from './client';

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  totalProjects: number;
  hasData: boolean;
}

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    // Ideally this should be a backend endpoint. 
    // For now we can fetch projects and tasks to calculate, or strictly assume backend exists.
    // Given the detailed constraints, I will try to hit a likely endpoint, or just return mock if 404.
    // However, safest for this task is to fetch lists.
    
    try {
        // Parallel fetch
        const [projectsRes, tasksRes] = await Promise.all([
            apiClient.get('/projects'),
            apiClient.get('/tasks')
        ]);
        
        const projects = projectsRes.data.data || [];
        const tasks = tasksRes.data.data || [];
        
        const hasData = projects.length > 0 || tasks.length > 0;
        
        const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
        const now = new Date();
        const overdueTasks = tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length;
        const upcomingDeadlines = tasks.filter((t: any) => {
            if (!t.dueDate || t.status === 'done') return false;
            const due = new Date(t.dueDate);
            const diff = due.getTime() - now.getTime();
            return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // 3 days
        }).length;

        return {
            success: true,
            data: {
                totalTasks: tasks.length,
                completedTasks,
                overdueTasks,
                upcomingDeadlines,
                totalProjects: projects.length,
                hasData
            }
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        return {
            success: false,
            message: 'Failed to load dashboard data',
            data: {
                totalTasks: 0,
                completedTasks: 0,
                overdueTasks: 0,
                upcomingDeadlines: 0,
                totalProjects: 0,
                hasData: false
            }
        };
    }
  }
};
