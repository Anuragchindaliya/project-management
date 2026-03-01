import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accessRequestApi } from "@/shared/api/access-request.api";
import { toast } from "sonner";

export const accessRequestKeys = {
  all: ["access-requests"] as const,
  pending: () => [...accessRequestKeys.all, "pending"] as const,
};

export function usePendingAccessRequests() {
  return useQuery({
    queryKey: accessRequestKeys.pending(),
    queryFn: () => accessRequestApi.getPendingRequests(),
  });
}

export function useRespondToAccessRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: "approved" | "rejected" }) =>
      accessRequestApi.respondToRequest(requestId, status),
    onSuccess: (_data, variables) => {
      toast.success(`Request ${variables.status === "approved" ? "approved" : "rejected"} successfully`);
      queryClient.invalidateQueries({ queryKey: accessRequestKeys.pending() });
      // Also potentially invalidate workspace members/project members if needed
      queryClient.invalidateQueries({ queryKey: ["workspace_members"] });
      queryClient.invalidateQueries({ queryKey: ["project_members"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to respond to request");
    },
  });
}
