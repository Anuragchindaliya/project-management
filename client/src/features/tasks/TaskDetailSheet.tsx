import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useTaskDetails, useAddComment, useAssignTask } from "@/entities/task/api/useTaskDetails";
import { useWorkspaceMembers } from "@/entities/workspace/api/useWorkspaces";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Send, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskDetailSheetProps {
    taskId: string | null;
    onClose: () => void;
}

export function TaskDetailSheet({ taskId, onClose }: TaskDetailSheetProps) {
    const { data: task, isLoading } = useTaskDetails(taskId);
    // Fetch workspace members using the workspace ID from the task's project
    const { data: members = [] } = useWorkspaceMembers(task?.project?.workspaceId || "");
    

    const { mutate: addComment, isPending: isAddingComment } = useAddComment();
    const { mutate: assignTask, isPending: isAssigning } = useAssignTask();
    const [comment, setComment] = useState("");

    if (!taskId) return null;

    const handleSendComment = () => {
        if (!comment.trim()) return;
        addComment({ taskId, content: comment }, {
            onSuccess: () => setComment("")
        });
    };

    const handleAssign = (userId: string) => {
        assignTask({ taskId, assigneeId: userId });
    };

    return (
        <Sheet open={!!taskId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader className="mb-4">
                    <SheetTitle>Task Details</SheetTitle>
                    {/* <SheetDescription>View and manage task</SheetDescription> */}
                </SheetHeader>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : task ? (
                    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                        {/* Header Info */}
                        <div>
                             <h2 className="text-2xl font-semibold leading-none tracking-tight mb-2">{task.title}</h2>
                             <div className="flex items-center gap-2">
                                <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'} className="uppercase text-xs">
                                    {task.priority}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{task.status.replace('_', ' ')}</span>
                             </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                                {task.description}
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs font-medium uppercase">Assignee</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs overflow-hidden">
                                         {task.assignee && task.assignee.avatarUrl && (
                                             <img src={task.assignee.avatarUrl} alt={task.assignee.firstName || 'User'} className="h-full w-full object-cover"/>
                                         )}
                                         {task.assignee && !task.assignee.avatarUrl && (
                                            <span>{task.assignee.firstName[0] + task.assignee.lastName[0]}</span>
                                         )}
                                         {!task.assignee && (
                                            <User className="h-4 w-4 text-muted-foreground" />
                                         )}
                                    </div>
                                    
                                    <Select 
                                        onValueChange={(e) => handleAssign(e)}
                                        disabled={isAssigning}
                                        value={task.assigneeId || ""}
                                        
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned" disabled>Unassigned</SelectItem>
                                            {members.map((member: any) => (
                                                <SelectItem key={member.member.userId} value={member.member.userId}>
                                                    {member.user.firstName} {member.user.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {isAssigning && <Loader2 className="h-3 w-3 animate-spin"/>}
                                </div>
                            </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs font-medium uppercase">Reporter</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                        {task.reporter?.firstName?.[0] || 'R'}
                                    </div>
                                    <span>{task.reporter?.firstName || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="flex-1 flex flex-col gap-4 mt-4 border-t pt-4">
                            <h3 className="font-semibold text-sm">Comments</h3>
                            
                            <div className="flex-1 space-y-4">
                                {task.comments?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                                ) : (
                                    task.comments?.map((c) => (
                                        <div key={c.comment.id} className="flex gap-3 text-sm">
                                             <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs font-medium">
                                                {c.user?.firstName?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{c.user?.firstName}</span>
                                                    <span className="text-xs text-muted-foreground">{format(new Date(c?.comment?.createdAt), 'MMM d, h:mm a')}</span>
                                                </div>
                                                <p className="text-foreground/90">{c.comment?.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Task not found
                    </div>
                )}

                <SheetFooter className="pt-4 border-t mt-auto">
                    <div className="flex w-full gap-2 items-center">
                        <Textarea 
                            placeholder="Write a comment..." 
                            className="min-h-[40px] max-h-[100px] resize-y" 
                            value={comment}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendComment();
                                }
                            }}
                        />
                        <Button size="icon" disabled={!comment.trim() || isAddingComment} onClick={handleSendComment}>
                            {isAddingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
