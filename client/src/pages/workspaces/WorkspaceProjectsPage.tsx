import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, FolderKanban, Clock, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProjectDialog } from '@/features/create/CreateProjectDialog';
import { InviteMemberDialog } from '@/features/workspace/InviteMemberDialog';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useWorkspaceProjects } from '@/entities/project/api/useProjects';
import { useWorkspaceById } from '@/entities/workspace/api/useWorkspaces';

export function WorkspaceProjectsPage() {
  const { workspaceId } = useParams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { canCreateProject } = usePermissions();

  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspaceById(workspaceId || "");
  const { data: projects = [], isLoading: isLoadingProjects } = useWorkspaceProjects(workspaceId || "");
  
  const isLoading = isLoadingWorkspace || isLoadingProjects;

  if (isLoading) {
      return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  if (!workspace) {
      return <div className="p-8">Workspace not found</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
            <p className="text-muted-foreground mt-1">Manage your projects and team members</p>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
            </Button>
            
            {/* RBAC Hidden Button */}
            {canCreateProject() && (
                <CreateProjectDialog workspaceId={workspaceId}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </CreateProjectDialog>
            )}
        </div>
      </div>
      
      {workspaceId && (
        <InviteMemberDialog 
            workspaceId={workspaceId} 
            open={inviteOpen} 
            onOpenChange={setInviteOpen} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="block h-full">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-xl">{project.name}</CardTitle>
                     <div className="px-2 py-1 rounded text-xs font-semibold bg-muted text-muted-foreground uppercase tracking-wider">
                         {project.key}
                     </div>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {project.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                   <div className="flex items-center text-sm text-muted-foreground mt-2">
                       <Clock className="mr-2 h-4 w-4" />
                       Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                   </div>
                </CardContent>
                <CardFooter className="pt-0 text-sm text-muted-foreground border-t bg-muted/20 p-4">
                     <div className="flex items-center gap-2">
                         <div className="flex -space-x-2">
                             <div className="h-6 w-6 rounded-full bg-blue-500 border-2 border-background" />
                             <div className="h-6 w-6 rounded-full bg-green-500 border-2 border-background" />
                         </div>
                         <span className="text-xs ml-2">Team</span>
                     </div>
                </CardFooter>
              </Card>
          </Link>
        ))}
        
        {projects.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-muted/50">
                <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                    Get started by creating your first project in this workspace.
                </p>
                {canCreateProject() && (
                    <CreateProjectDialog workspaceId={workspaceId}>
                        <Button variant="outline">Create Project</Button>
                    </CreateProjectDialog>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
