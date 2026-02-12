
import { useWorkspaceMembers, useUpdateMemberRole, useRemoveMember, useWorkspaceById } from "@/entities/workspace/api/useWorkspaces";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Trash2, Mail, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { InviteMemberDialog } from "@/features/workspace/InviteMemberDialog";

export function WorkspaceMembersPage() {
    const { workspaceId } = useParams();
    const { data: workspace } = useWorkspaceById(workspaceId || "");
    const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId || "");
    const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole();
    const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
    const { canManageMembers } = usePermissions();
    const [search, setSearch] = useState("");
    const [inviteOpen, setInviteOpen] = useState(false);

    const filteredMembers = members.filter((m) => 
        m.user.firstName.toLowerCase().includes(search.toLowerCase()) || 
        m.user.lastName.toLowerCase().includes(search.toLowerCase()) || 
        m.user.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleRoleChange = (userId: string, newRole: string) => {
        updateRole({ workspaceId: workspaceId!, userId, role: newRole as any }, {
            onSuccess: () => toast.success("Role updated")
        });
    };

    const handleRemove = (userId: string) => {
         if (confirm("Remove this member?")) {
            removeMember({ workspaceId: workspaceId!, userId }, {
                onSuccess: () => toast.success("Member removed")
            });
         }
    };
    console.log({filteredMembers})

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                     <p className="text-muted-foreground">{workspace?.name} Workspace</p>
                </div>
                {canManageMembers() && (
                    <Button onClick={() => setInviteOpen(true)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Invite People
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle>Manage Access</CardTitle>
                            <CardDescription>View and manage workspace members and their roles.</CardDescription>
                         </div>
                         <div className="relative w-72">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                             <Input 
                                placeholder="Search members..." 
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                             />
                         </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredMembers.map((member) => (
                            <div key={member.user.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        {member.user.avatarUrl ? <AvatarImage src={member.user.avatarUrl} /> : <AvatarFallback>{member.user.firstName[0]}</AvatarFallback>}
                                    </Avatar>
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {member.user.firstName} {member.user.lastName}
                                            {member.user.id === workspace?.ownerId && <Badge variant="secondary" className="text-[10px]">Owner</Badge>}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{member.user.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                     <div className="text-sm text-muted-foreground">
                                        Joined {new Date(member.member.joinedAt).toLocaleDateString()}
                                     </div>
                                     {canManageMembers() && member.member.userId !== workspace?.ownerId ? (
                                         <div className="flex items-center gap-2">
                                             <Select 
                                                defaultValue={member.member.role} 
                                                onValueChange={(val) => handleRoleChange(member.member.userId, val)}
                                                disabled={isUpdating}
                                             >
                                                <SelectTrigger className="w-[110px] h-9">
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
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemove(member.member.userId)}
                                                disabled={isRemoving}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                         </div>
                                     ) : (
                                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded text-sm font-medium capitalize">
                                             <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                             {member.member.role}
                                         </div>
                                     )}
                                </div>
                            </div>
                        ))}

                        {filteredMembers.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No members found matching "{search}"
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <InviteMemberDialog 
                workspaceId={workspaceId || ""} 
                open={inviteOpen} 
                onOpenChange={setInviteOpen} 
            />
        </div>
    );
}
