import { usePendingAccessRequests, useRespondToAccessRequest } from "@/entities/access-request/api/useAccessRequests";
import { useWorkspaceById } from "@/entities/workspace/api/useWorkspaces";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2, Check, X, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WorkspaceAccessRequestsPage() {
  const { workspaceId } = useParams();
  const { data: workspace } = useWorkspaceById(workspaceId || "");
  const { data: requests = [], isLoading } = usePendingAccessRequests();
  const { mutate: respond, isPending: isResponding } = useRespondToAccessRequest();
  const { canManageMembers } = usePermissions();

  const handleRespond = (requestId: string, status: "approved" | "rejected") => {
    respond({ requestId, status });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Filter requests for this specific workspace
  const workspaceRequests = requests.filter((r: any) => r.request.workspaceId === workspaceId);

  if (!canManageMembers()) {
     return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground max-w-md">
                You do not have permission to manage workspace members or access requests.
            </p>
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
        <p className="text-muted-foreground">
          Pending requests for {workspace?.name} Workspace
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Review and approve or reject access requests from users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workspaceRequests.map((item: any) => (
              <div
                key={item.request.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors gap-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    {item.user.avatarUrl ? (
                      <AvatarImage src={item.user.avatarUrl} />
                    ) : (
                      <AvatarFallback>{item.user.firstName[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {item.user.firstName} {item.user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.user.email}
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">
                      {item.request.requestedRole}
                    </Badge>
                    {item.project && (
                      <span className="text-xs text-muted-foreground italic">
                        for project: <span className="font-semibold">{item.project.name}</span>
                      </span>
                    )}
                  </div>
                  {item.request.message && (
                     <p className="text-sm border-l-2 border-primary/20 pl-3 py-1 italic text-muted-foreground">
                        "{item.request.message}"
                     </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center text-[10px] text-muted-foreground mr-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(item.request.createdAt).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleRespond(item.request.id, "rejected")}
                    disabled={isResponding}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handleRespond(item.request.id, "approved")}
                    disabled={isResponding}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}

            {workspaceRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Check className="h-8 w-8" />
                </div>
                <p className="font-medium text-lg">All caught up!</p>
                <p>No pending access requests for this workspace.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
