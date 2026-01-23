import { KanbanBoard } from "@/features/kanban/KanbanBoard";
import { CreateProjectDialog } from "@/features/create/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ProjectsPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between px-4">
        <h1 className="text-2xl font-bold tracking-tight">Board</h1>
        <div className="flex gap-2">
            {/* Project switcher or filter could go here */}
            <CreateProjectDialog>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </CreateProjectDialog>
        </div>
      </div>
      
      {/* Kanban Board Container */}
      <div className="flex-1 min-h-0">
         <KanbanBoard />
      </div>
    </div>
  );
}
