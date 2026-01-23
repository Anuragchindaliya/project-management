import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  // Add other fields as needed
}

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-primary/10 border-2 border-primary rounded-xl h-24"
      />
    );
  }

  const priorityColor = {
      low: "bg-green-100 text-green-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
  }[task.priority] || "bg-gray-100 text-gray-800";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab hover:shadow-md transition-all active:cursor-grabbing",
        "bg-card/50 backdrop-blur-sm"
      )}
    >
      <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
          <span className="text-sm font-semibold line-clamp-2 leading-tight">{task.title}</span>
          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
      </CardHeader>
      <CardContent className="p-3 pt-2">
         <div className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", priorityColor)}>
             {task.priority}
         </div>
      </CardContent>
    </Card>
  );
}
