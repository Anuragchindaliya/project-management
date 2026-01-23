import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInviteMember } from "@/entities/workspace/api/useWorkspaces";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InviteMemberDialogProps {
    workspaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ workspaceId, open, onOpenChange }: InviteMemberDialogProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
    const { mutate: inviteMember, isPending } = useInviteMember();

    const handleInvite = () => {
        if (!email.trim()) return;
        
        inviteMember({ workspaceId, email, role }, {
            onSuccess: (data: any) => {
                toast.success(data.status === 'added' ? "Member Added" : "Invitation Sent", {
                    description: data.status === 'added' 
                        ? "User has been added to the workspace." 
                        : `Invitation sent to ${email}.`,
                });
                setEmail("");
                setRole("member");
                onOpenChange(false);
            },
            onError: (error: any) => {
                toast.error("Error", {
                    description: error.message || "Failed to invite member",
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <select 
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                        >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleInvite} disabled={isPending || !email}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
