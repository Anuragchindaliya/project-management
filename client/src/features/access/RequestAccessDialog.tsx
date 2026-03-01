import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accessRequestApi } from "@/shared/api/access-request.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  projectId: string;
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestAccessDialog({ projectId, workspaceId, isOpen, onClose }: Props) {
  const [role, setRole] = useState("developer");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      accessRequestApi.createRequest({
        projectId,
        workspaceId,
        requestedRole: role,
        message,
      }),
    onSuccess: () => {
      toast.success("Access request sent successfully");
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send access request");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Access</DialogTitle>
          <DialogDescription>
            You don't have permission to update tasks in this project. Request access from the project owner.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="role" className="text-sm font-medium">Requested Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Developer (Can update tasks)</SelectItem>
                <SelectItem value="lead">Lead (Full control)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">Message (Optional)</label>
            <Textarea
              id="message"
              placeholder="Why do you need access?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
