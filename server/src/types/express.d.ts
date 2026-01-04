import { ProjectRole, WorkspaceRole } from "./rbac.types.ts";

export interface UserPayload {
  userId: string;
  email: string;
  username: string;

  // OPTIONAL FIELDS that RBAC middleware will add dynamically
  workspaceRole?: WorkspaceRole;
  projectRole?: ProjectRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
