import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useWorkspaceMembers, useUpdateMemberRole, useRemoveMember } from "@/entities/workspace/api/useWorkspaces";
import { useWorkspaceStore } from "@/shared/stores/useWorkspaceStore";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { toast } from "sonner";

interface WorkspaceSettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function WorkspaceSettingsDialog({ open, onOpenChange, children }: WorkspaceSettingsDialogProps) {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: members = [], isLoading: isLoadingMembers } = useWorkspaceMembers(activeWorkspaceId || "");
  const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
  const { canManageMembers } = usePermissions();

  const [inviteOpen, setInviteOpen] = useState(false);

  // If no active workspace, don't render content or show error
  if (!activeWorkspaceId) return null;

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRole({ workspaceId: activeWorkspaceId, userId, role: newRole as any }, {
        onSuccess: () => toast.success("Role updated successfully")
    });
  };

  const handleRemoveMember = (userId: string) => {
      if (confirm("Are you sure you want to remove this member?")) {
          removeMember({ workspaceId: activeWorkspaceId, userId }, {
              onSuccess: () => toast.success("Member removed successfully")
          });
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Workspace Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="members" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-2">
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="members" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
            <div className="px-6 py-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium">Team Members</h3>
                    <p className="text-sm text-muted-foreground">Manage who has access to this workspace</p>
                </div>
                <Button onClick={() => setInviteOpen(true)} size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite People
                </Button>
            </div>
            
            <Separator />

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                    {isLoadingMembers ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        members.map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.user.avatarUrl} />
                                        <AvatarFallback>{member.user.firstName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-sm">
                                            {member.user.firstName} {member.user.lastName}
                                            {member.user.id === member.workspace?.ownerId && <span className="ml-2 text-xs text-muted-foreground">(Owner)</span>}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{member.user.email}</div>
                                    </div>
                                </div>

                                {canManageMembers() ? (
                                    <div className="flex items-center gap-2">
                                        <Select 
                                            defaultValue={member.role} 
                                            onValueChange={(val) => handleRoleChange(member.userId, val)}
                                            disabled={isUpdating}
                                        >
                                            <SelectTrigger className="w-[110px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemoveMember(member.userId)}
                                            disabled={isRemoving}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground capitalize border px-2 py-1 rounded">
                                        {member.role}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="general" className="p-6">
             <Card>
                 <CardHeader>
                     <CardTitle>Workspace Name</CardTitle>
                     <CardDescription>This is the name of your workspace visible to your team.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <div className="flex gap-2">
                         <Input defaultValue="Acme Inc" disabled />
                         <Button disabled>Save</Button>
                     </div>
                 </CardContent>
             </Card>
          </TabsContent>
        </Tabs>

        {/* Nested Dialog for Invite */}
        <InviteMemberDialog workspaceId={activeWorkspaceId} open={inviteOpen} onOpenChange={setInviteOpen} />
      </DialogContent>
    </Dialog>
  );
}
