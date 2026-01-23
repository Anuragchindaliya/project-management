
import { useUserTasks } from "@/entities/task/api/useTasks";
import { Loader2, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { TaskDetailSheet } from "@/features/tasks/TaskDetailSheet";

export function TasksPage() {
    const { data: tasks, isLoading } = useUserTasks();
    console.log({tasks})
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                <p className="text-muted-foreground">Manage tasks assigned to you across all projects.</p>
            </div>

            <div className="grid gap-4">
                {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                        <Card 
                            key={task.task.id} 
                            className="bg-card hover:bg-accent/5 transition-colors cursor-pointer border-l-4 border-l-primary"
                            onClick={() => setSelectedTaskId(task.task.id)}
                        >
                            <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-semibold leading-none">{task.task.title}</h3>
                                    <div className="text-sm text-muted-foreground line-clamp-1">{task.task.description}</div>
                                    <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground/80">
                                         <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 gap-1 font-normal">
                                            <Briefcase className="h-3 w-3" />
                                            {task.project?.name || 'Project'}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {task.task.createdAt ? format(new Date(task.task.createdAt), 'MMM d') : '-'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Badge variant={task?.task?.status === 'done' ? 'default' : 'secondary'} className="capitalize">
                                        {task?.task?.status?.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant={task?.task?.priority === 'urgent' ? 'destructive' : 'outline'} className="capitalize">
                                        {task?.task?.priority}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">All caught up!</h3>
                        <p className="text-sm text-muted-foreground">You don't have any assigned tasks right now.</p>
                    </div>
                )}
            </div>

            <TaskDetailSheet 
                taskId={selectedTaskId} 
                onClose={() => setSelectedTaskId(null)} 
            />
        </div>
    );
}
