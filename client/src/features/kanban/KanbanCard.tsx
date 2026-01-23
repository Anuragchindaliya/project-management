import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/shared/types/drizzle.types";

interface Props {
  task: Task;
  onClick?: () => void;
}

export function KanbanCard({ task, onClick }: Props) {
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
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-card p-3 rounded-lg border shadow-sm h-[100px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-card p-3 rounded-lg border shadow-sm cursor-grab hover:ring-2 hover:ring-primary/50 group"
    >
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm line-clamp-2">{task.title}</span>
        <div className="flex items-center justify-between mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold
                ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' : 
                  task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-700'}
            `}>
                {task.priority}
            </span>
            {task.assignee && (
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">
                    {task.assignee.firstName?.[0] || 'U'}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
