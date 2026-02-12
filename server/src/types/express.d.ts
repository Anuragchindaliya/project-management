import { ProjectRole, WorkspaceRole } from "./rbac.types.ts";

export interface UserPayload {
  userId: string;
  email: string;
  username: string;

  firstName?: string;
  lastName?: string;
  avatarUrl?: string;

  // OPTIONAL FIELDS that RBAC middleware will add dynamically
  workspaceMemberships?: { workspaceId: string; role: "owner" | "admin" | "member" | "viewer" }[];
  workspaceRole?: WorkspaceRole;
  projectRole?: ProjectRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      params: any; // FIXES params missing issue
      body: any; // FIXES ReadableStream issue
    }
  }
}
