import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useProjectTasks, useUpdateTask } from "@/entities/task/api/useTasks";
import { TaskDetailSheet } from "@/features/tasks/TaskDetailSheet";
import { useTaskSocketEvents } from "@/shared/hooks/useTaskSocket";
import { CreateTaskDialog } from "@/features/create/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Lock } from "lucide-react";
import { useProjectPermissions } from "@/entities/project/api/useProjectPermissions";
import { RequestAccessDialog } from "@/features/access/RequestAccessDialog";
import { useWorkspaceStore } from "@/shared/stores/useWorkspaceStore";

const defaultCols = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
];

export function KanbanBoard() {
  const { projectId } = useParams();
  const { activeWorkspaceId } = useWorkspaceStore();
  const [columns] = useState(defaultCols);
  
  const { data: tasks = [] } = useProjectTasks(projectId || "");
  const { data: permissions, isLoading: permissionsLoading } = useProjectPermissions(projectId);
  console.log("🚀 ~ KanbanBoard ~ permissions:", permissions)
  const { mutate: updateTask } = useUpdateTask(projectId || "");
  
  useTaskSocketEvents(projectId); // Real-time sync

  const [activeColumn, setActiveColumn] = useState<any | null>(null);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const canManageTasks = permissions?.canManageTasks ?? false;

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  function onDragStart(event: DragStartEvent) {
    if (!canManageTasks) return; // Prevent dragging start

    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isActiveTask = active.data.current?.type === "Task";
    if (!isActiveTask) return;
    
    // Check if dropped over column
    const isOverColumn = over.data.current?.type === "Column";
    if (isOverColumn) {
        if (activeTask?.columnId !== overId) {
             updateTask({ taskId: activeId, data: { status: overId as any } });
        }
    }
    
    // Check if dropped over task
    const isOverTask = over.data.current?.type === "Task";
    if (isOverTask) {
        const overTask = over.data.current?.task;
        if (overTask && overTask.columnId !== activeTask?.columnId) {
             updateTask({ taskId: activeId, data: { status: overTask.columnId as any } });
        }
    }
  }

  function onDragOver(_event: DragOverEvent) {
      // Visual only logic if needed
  }
  
  const mappedTasks = useMemo(() => {
      return tasks.map(t => ({
          ...t,
          columnId: t.status 
      }));
  }, [tasks]);

  return (
    <div className="flex flex-col h-full gap-4">
        {/* Kanban Toolbar */}
        <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    Filter
                 </Button>
                 {!canManageTasks && !permissionsLoading && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                      onClick={() => setIsRequestDialogOpen(true)}
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Request Edit Access
                    </Button>
                 )}
            </div>
            
            {canManageTasks && (
              <CreateTaskDialog projectId={projectId}>
                  <Button size="sm" className="h-8 gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      Task
                  </Button>
              </CreateTaskDialog>
            )}
        </div>

        <div className="flex flex-1 w-full overflow-x-auto overflow-y-hidden px-4 pb-4">
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
          >
            <div className="flex gap-4 h-full">
                <SortableContext items={columnsId}>
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        tasks={mappedTasks.filter((task) => task.columnId === col.id)}
                        onTaskClick={setSelectedTaskId}
                        isDraggable={canManageTasks}
                    />
                ))}
                </SortableContext>
            </div>

            {createPortal(
              <DragOverlay>
                {activeColumn && (
                  <KanbanColumn
                    column={activeColumn}
                    tasks={mappedTasks.filter(
                      (task) => task.columnId === activeColumn.id
                    )}
                  />
                )}
                {activeTask && <KanbanCard task={activeTask} isDraggable={canManageTasks} />}
              </DragOverlay>,
              document.body
            )}
          </DndContext>

            <TaskDetailSheet 
                taskId={selectedTaskId} 
                onClose={() => setSelectedTaskId(null)} 
            />
        </div>

        <RequestAccessDialog
          projectId={projectId!}
          workspaceId={activeWorkspaceId!}
          isOpen={isRequestDialogOpen}
          onClose={() => setIsRequestDialogOpen(false)}
        />
    </div>
  );
}
