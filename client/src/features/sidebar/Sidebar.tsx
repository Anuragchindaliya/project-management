import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  Inbox,
  Settings,
  UserPlus,
  LogOut,
  ChevronDown,
  ChevronRight,
  Search,
  Briefcase,
  MoreHorizontal,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/app/providers/AuthProvider";
import { useUserWorkspaces } from "@/entities/workspace/api/useWorkspaces";
import { useWorkspaceStore } from "@/shared/stores/useWorkspaceStore";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useWorkspaceProjects } from "@/entities/project/api/useProjects";
import { CreateProjectDialog } from "@/features/create/CreateProjectDialog";
import { InviteMemberDialog } from "@/features/workspace/InviteMemberDialog";
import { CreateWorkspaceDialog } from "@/features/create/CreateWorkspaceDialog"; 
import { WorkspaceSettingsDialog } from "@/features/workspace/WorkspaceSettingsDialog"; 

export function Sidebar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const { data: workspaces = [] } = useUserWorkspaces();
  const { canCreateProject, canManageMembers } = usePermissions(); // Removed arg

  // Local state for UI
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  // Sync active workspace from URL or Store
  // If URL has /workspaces/:id, set that as active.
  const pathWorkspaceId = location.pathname.match(/\/workspaces\/([^\/]+)/)?.[1];
  
  useEffect(() => {
    if (pathWorkspaceId) {
      setActiveWorkspace(pathWorkspaceId);
    } else if (!activeWorkspaceId && workspaces.length > 0) {
       // Default to first workspace if none active
       // Optional: Don't force navigation, just set ID context if we can.
       // But if we are at /dashboard, maybe we want 'personal' or 'all'?
       // For now, let's just default to first if user has one.
       setActiveWorkspace(workspaces[0].workspace.id);
    }
  }, [pathWorkspaceId, workspaces, activeWorkspaceId, setActiveWorkspace]);


  const activeWorkspace = workspaces.find(w => w.workspace.id === activeWorkspaceId)?.workspace;
  const { data: projects = [] } = useWorkspaceProjects(activeWorkspaceId || "");

  const filteredProjects = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWorkspaceChange = (id: string) => {
      setActiveWorkspace(id);
      navigate(`/workspaces/${id}`);
  };

  return (
    <div className={cn("flex flex-col h-screen border-r bg-muted/10 pb-4 w-[280px]", className)}>
        {/* 1. Identity / Workspace Switcher */}
        <div className="h-16 flex items-center px-4 border-b">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between px-2 hover:bg-muted/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                {activeWorkspace?.name?.[0] || <Briefcase className="h-4 w-4" />}
                            </div>
                            <span className="font-semibold truncate">
                                {activeWorkspace?.name || "Select Workspace"}
                            </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[260px]" align="start">
                    <DropdownMenuLabel>My Workspaces</DropdownMenuLabel>
                    {workspaces.map(ws => (
                        <DropdownMenuItem key={ws.workspace.id} onClick={() => handleWorkspaceChange(ws.workspace.id)}>
                            <Briefcase className="mr-2 h-4 w-4" />
                            {ws.workspace.name}
                            {ws.workspace.id === activeWorkspaceId && <span className="ml-auto text-xs">Active</span>}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <CreateWorkspaceDialog>
                         <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                            <Plus className="mr-2 h-4 w-4" />
                            <span>New Workspace</span>
                        </div>
                    </CreateWorkspaceDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* 2. Navigation */}
        <div className="px-3 py-4 space-y-1">
            <NavLink 
                to="/dashboard" 
                className={({isActive}) => cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
            </NavLink>
            <NavLink 
                to="/tasks" 
                className={({isActive}) => cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                <ListTodo className="h-4 w-4" />
                My Tasks
            </NavLink>
            <div className="relative">
                <NavLink 
                    to="/inbox" 
                    className={({isActive}) => cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Inbox className="h-4 w-4" />
                    Inbox
                </NavLink>
                 {/* Real-time Mock Indicator */}
                 <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            </div>
        </div>

        {/* 3. Workspace Projects */}
        <div className="flex-1 flex flex-col min-h-0 px-3 mt-2">
            <div className="flex items-center justify-between px-3 py-2 group">
                 <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Projects</h3>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setProjectsCollapsed(!projectsCollapsed)}>
                         {projectsCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                     </Button>
                     {/* Can Create Project */}
                     {activeWorkspaceId && canCreateProject() && (
                          <CreateProjectDialog workspaceId={activeWorkspaceId}>
                                <Button variant="ghost" size="icon" className="h-4 w-4">
                                    <Plus className="h-3 w-3" />
                                </Button>
                          </CreateProjectDialog>
                     )}
                 </div>
            </div>
            
            {/* Search Bar */}
             {!projectsCollapsed && (
                <div className="mb-2 px-1">
                   <div className="relative">
                       <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                       <Input 
                           placeholder="Filter projects..." 
                           className="h-8 pl-8 text-xs bg-background/50 border-none shadow-sm focus-visible:ring-1"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                       />
                   </div>
                </div>
            )}

            {/* Project List */}
            {!projectsCollapsed && (
                <div className="overflow-y-auto min-h-0 flex-1 space-y-0.5">
                    {filteredProjects.length === 0 ? (
                        <p className="px-3 text-xs text-muted-foreground italic py-2">No projects found</p>
                    ) : (
                        filteredProjects.map(project => (
                             <NavLink 
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className={({isActive}) => cn(
                                    "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors group",
                                    isActive ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <span className="flex-1 truncate">{project.name}</span>
                                {project.key && <span className="text-[10px] text-muted-foreground/70 uppercase border px-1 rounded">{project.key}</span>}
                            </NavLink>
                        ))
                    )}
                </div>
            )}
        </div>

        {/* 4. Workspace Management (Bottom/Fixed) */}
        {activeWorkspaceId && (
            <div className="px-3 py-2 space-y-1 border-t mt-auto">
                 {/* Settings / Members */}
                 {canManageMembers() && (
                    <>
                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">WORKSPACE SETTINGS</div>
                         <Button 
                            variant="ghost" 
                            className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => setInviteOpen(true)}
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Members
                         </Button>
                         
                         <WorkspaceSettingsDialog>
                            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                         </WorkspaceSettingsDialog>
                    </>
                 )}
            </div>
        )}
        
        {/* 5. User Profile */}
        <div className="border-t p-4">
             <div className="flex items-center gap-3">
                 <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                     {user?.firstName?.[0] || 'U'}
                 </div>
                 <div className="flex flex-col flex-1 overflow-hidden">
                     <span className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</span>
                     <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                 </div>
                 <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                             <MoreHorizontal className="h-4 w-4" />
                         </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                         <DropdownMenuLabel>My Account</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem>Profile</DropdownMenuItem>
                         <DropdownMenuItem onClick={logout}>
                             <LogOut className="mr-2 h-4 w-4" />
                             Log out
                         </DropdownMenuItem>
                     </DropdownMenuContent>
                 </DropdownMenu>
             </div>
        </div>

        {/* Dialogs */}
        {activeWorkspaceId && <InviteMemberDialog workspaceId={activeWorkspaceId} open={inviteOpen} onOpenChange={setInviteOpen} />}
    </div>
  );
}
