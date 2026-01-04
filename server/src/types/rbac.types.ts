export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
}

export enum ProjectRole {
  LEAD = "lead",
  DEVELOPER = "developer",
  VIEWER = "viewer",
}

export const WORKSPACE_ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  [WorkspaceRole.OWNER]: 4,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.MEMBER]: 2,
  [WorkspaceRole.VIEWER]: 1,
};

export const PROJECT_ROLE_HIERARCHY: Record<ProjectRole, number> = {
  [ProjectRole.LEAD]: 3,
  [ProjectRole.DEVELOPER]: 2,
  [ProjectRole.VIEWER]: 1,
};

export interface WorkspacePermissions {
  canManageMembers: boolean;
  canCreateProjects: boolean;
  canDeleteProjects: boolean;
  canManageSettings: boolean;
  canViewWorkspace: boolean;
}

export interface ProjectPermissions {
  canManageTasks: boolean;
  canCreateTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
  canViewProject: boolean;
  canEditProject: boolean;
}
