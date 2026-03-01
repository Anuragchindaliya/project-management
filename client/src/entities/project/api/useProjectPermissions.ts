import { useQuery } from "@tanstack/react-query";
import { projectApi } from "./project.api";

export function useProjectPermissions(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-permissions", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await projectApi.getProjectPermissions(projectId);
      console.log("🚀 ~ useProjectPermissions ~ response:", response)
    //   if (!response.success) throw new Error(response.error || "Failed to fetch permissions");
    //   return response.data.permissions;
    return response;
    },
    enabled: !!projectId,
  });
}
