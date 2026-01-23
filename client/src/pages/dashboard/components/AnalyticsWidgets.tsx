import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingDeadlines: number;
}

interface AnalyticsWidgetsProps {
  data?: AnalyticsData;
  isLoading?: boolean;
}

export function AnalyticsWidgets({ data, isLoading }: AnalyticsWidgetsProps) {
  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
        ))}
    </div>;
  }

  const stats = [
    {
      title: 'Total Tasks',
      value: data?.totalTasks || 0,
      icon: Target,
      color: 'text-blue-500',
    },
    {
      title: 'Completed',
      value: data?.completedTasks || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'Overdue',
      value: data?.overdueTasks || 0,
      icon: AlertCircle,
      color: 'text-red-500',
    },
    {
      title: 'Due Soon',
      value: data?.upcomingDeadlines || 0,
      icon: Clock,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {/* Optional subtext */}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
