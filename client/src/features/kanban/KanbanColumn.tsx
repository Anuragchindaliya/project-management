import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import { KanbanCard } from "./KanbanCard";
import { Task } from "@/shared/types/drizzle.types";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "../create/CreateTaskDialog";
import { useParams } from "react-router-dom";

interface Column {
    id: string;
    title: string;
}

interface Props {
  column: Column;
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function KanbanColumn({ column, tasks, onTaskClick }: Props) {
    const { projectId } = useParams();
  
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="w-[350px] min-w-[350px] h-[calc(100vh-200px)] rounded-md flex flex-col bg-muted/30 border border-border/50"
    >
      <div className="bg-muted/50 p-3 text-sm font-semibold rounded-t-md flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
           <span className={`w-2 h-2 rounded-full 
             ${column.id === 'todo' ? 'bg-slate-500' :
               column.id === 'in_progress' ? 'bg-blue-500' :
               column.id === 'in_review' ? 'bg-yellow-500' :
               'bg-green-500'}
           `} />
           {column.title}
        </div>
        <span className="bg-background px-2 py-0.5 rounded text-xs text-muted-foreground border shadow-sm">{tasks.length}</span>
      </div>

      <div className="flex flex-grow flex-col gap-3 p-3 overflow-y-auto overflow-x-hidden">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={() => onTaskClick?.(task.id)} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <CreateTaskDialog projectId={projectId}>
             <Button variant="outline"  className="flex items-center justify-center h-20 text-xs text-muted-foreground border-2 border-dashed rounded-lg opacity-50">
                 Drop items here or Create Task
             </Button>
          </CreateTaskDialog>
        )}
      </div>
    </div>
  );
}
