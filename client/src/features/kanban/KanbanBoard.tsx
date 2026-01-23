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
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { createPortal } from "react-dom";

// Mock Data Types (Replace with actual types from API)
interface Task {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    columnId: string;
}

const defaultCols = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
];

const defaultTasks: Task[] = [
    { id: "1", title: "Implement Sidebar", priority: "high", columnId: "todo" },
    { id: "2", title: "Create Login Page", priority: "urgent", columnId: "done" },
    { id: "3", title: "Setup Database", priority: "medium", columnId: "in_progress" },
];

export function KanbanBoard() {
  const [columns, _setColumns] = useState(defaultCols);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [activeColumn, setActiveColumn] = useState<any | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  function onDragStart(event: DragStartEvent) {
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

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle Task Drop
    const isActiveTask = active.data.current?.type === "Task";
    if (!isActiveTask) return;
    
    // In same column or different column (handled by onDragOver usually, 
    // but onDragEnd finalizes it)
    
    // For simplicity in this demo, standard array move might not enough if we assume API updates.
    // We update local state to reflect new order/column.
    
    // Note: detailed reordering logic for different columns is handled in onDragOver usually for visual feedback
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverColumn = over.data.current?.type === "Column";

    // Dropping a Task over a Column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId as string;
        
        // Move to end of column or specific logic
        return arrayMove(tasks, activeIndex, activeIndex); 
      });
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-x-auto overflow-y-hidden px-4">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex gap-4">
            <SortableContext items={columnsId}>
            {columns.map((col) => (
                <KanbanColumn
                    key={col.id}
                    column={col}
                    tasks={tasks.filter((task) => task.columnId === col.id)}
                />
            ))}
            </SortableContext>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && <KanbanCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
