import { db } from "../db/connection";
import { workspaceMembers, projectMembers, projects } from "../db/schema";
import { eq, and } from "drizzle-orm";
import {
  WorkspaceRole,
  ProjectRole,
  WORKSPACE_ROLE_HIERARCHY,
  PROJECT_ROLE_HIERARCHY,
  WorkspacePermissions,
  ProjectPermissions,
} from "../types/rbac.types";

export class RBACService {
  // ============================================
  // WORKSPACE PERMISSIONS
  // ============================================

  async getUserWorkspaceRole(
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceRole | null> {
    const [member] = await db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );

    return member ? (member.role as WorkspaceRole) : null;
  }

  async hasWorkspaceRole(
    workspaceId: string,
    userId: string,
    minRole: WorkspaceRole
  ): Promise<boolean> {
    const userRole = await this.getUserWorkspaceRole(workspaceId, userId);

    if (!userRole) return false;

    const userRoleLevel = WORKSPACE_ROLE_HIERARCHY[userRole];
    const requiredRoleLevel = WORKSPACE_ROLE_HIERARCHY[minRole];

    return userRoleLevel >= requiredRoleLevel;
  }

  getWorkspacePermissions(role: WorkspaceRole): WorkspacePermissions {
    switch (role) {
      case WorkspaceRole.OWNER:
        return {
          canManageMembers: true,
          canCreateProjects: true,
          canDeleteProjects: true,
          canManageSettings: true,
          canViewWorkspace: true,
        };
      case WorkspaceRole.ADMIN:
        return {
          canManageMembers: true,
          canCreateProjects: true,
          canDeleteProjects: true,
          canManageSettings: false,
          canViewWorkspace: true,
        };
      case WorkspaceRole.MEMBER:
        return {
          canManageMembers: false,
          canCreateProjects: true,
          canDeleteProjects: false,
          canManageSettings: false,
          canViewWorkspace: true,
        };
      case WorkspaceRole.VIEWER:
        return {
          canManageMembers: false,
          canCreateProjects: false,
          canDeleteProjects: false,
          canManageSettings: false,
          canViewWorkspace: true,
        };
      default:
        throw new Error("Invalid workspace role");
    }
  }

  // ============================================
  // PROJECT PERMISSIONS
  // ============================================

  async getUserProjectRole(
    projectId: string,
    userId: string
  ): Promise<ProjectRole | null> {
    const [member] = await db
      .select({ role: projectMembers.role })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        )
      );

    return member ? (member.role as ProjectRole) : null;
  }

  async hasProjectRole(
    projectId: string,
    userId: string,
    minRole: ProjectRole
  ): Promise<boolean> {
    const userRole = await this.getUserProjectRole(projectId, userId);

    if (!userRole) return false;

    const userRoleLevel = PROJECT_ROLE_HIERARCHY[userRole];
    const requiredRoleLevel = PROJECT_ROLE_HIERARCHY[minRole];

    return userRoleLevel >= requiredRoleLevel;
  }

  getProjectPermissions(role: ProjectRole): ProjectPermissions {
    switch (role) {
      case ProjectRole.LEAD:
        return {
          canManageTasks: true,
          canCreateTasks: true,
          canDeleteTasks: true,
          canAssignTasks: true,
          canViewProject: true,
          canEditProject: true,
        };
      case ProjectRole.DEVELOPER:
        return {
          canManageTasks: true,
          canCreateTasks: true,
          canDeleteTasks: false,
          canAssignTasks: true,
          canViewProject: true,
          canEditProject: false,
        };
      case ProjectRole.VIEWER:
        return {
          canManageTasks: false,
          canCreateTasks: false,
          canDeleteTasks: false,
          canAssignTasks: false,
          canViewProject: true,
          canEditProject: false,
        };
      default:
        throw new Error("Invalid project role");
    }
  }

  // ============================================
  // COMBINED PERMISSIONS (Workspace + Project)
  // ============================================

  async canAccessProject(projectId: string, userId: string): Promise<boolean> {
    // Get project's workspace
    const [project] = await db
      .select({ workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) return false;

    // Check if user is workspace member
    const workspaceRole = await this.getUserWorkspaceRole(
      project.workspaceId,
      userId
    );
    if (workspaceRole) return true;

    // Check if user is project member
    const projectRole = await this.getUserProjectRole(projectId, userId);
    return projectRole !== null;
  }

  async canPerformProjectAction(
    projectId: string,
    userId: string,
    action: keyof ProjectPermissions
  ): Promise<boolean> {
    // First check project-level permissions
    const projectRole = await this.getUserProjectRole(projectId, userId);
    if (projectRole) {
      const permissions = this.getProjectPermissions(projectRole);
      if (permissions[action]) return true;
    }

    // If not a project member, check workspace-level permissions
    const [project] = await db
      .select({ workspaceId: projects.workspaceId, ownerId: projects.ownerId })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) return false;

    // Project owner always has permissions
    if (project.ownerId === userId) return true;

    const workspaceRole = await this.getUserWorkspaceRole(
      project.workspaceId,
      userId
    );
    if (!workspaceRole) return false;

    // Workspace admins and owners have elevated project permissions
    if (
      workspaceRole === WorkspaceRole.OWNER ||
      workspaceRole === WorkspaceRole.ADMIN
    ) {
      return true;
    }

    return false;
  }

  async getAllProjectPermissions(
    projectId: string,
    userId: string
  ): Promise<ProjectPermissions> {
    const projectRole = await this.getUserProjectRole(projectId, userId);
    let permissions: ProjectPermissions;

    if (projectRole) {
      permissions = this.getProjectPermissions(projectRole);
    } else {
      // Default permissions for non-members
      permissions = {
        canManageTasks: false,
        canCreateTasks: false,
        canDeleteTasks: false,
        canAssignTasks: false,
        canViewProject: false,
        canEditProject: false,
      };
    }

    // Check workspace-level elevation and project ownership
    const [project] = await db
      .select({ workspaceId: projects.workspaceId, ownerId: projects.ownerId })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (project) {
      if (project.ownerId === userId) {
        return {
          canManageTasks: true,
          canCreateTasks: true,
          canDeleteTasks: true,
          canAssignTasks: true,
          canViewProject: true,
          canEditProject: true,
        };
      }

      const workspaceRole = await this.getUserWorkspaceRole(
        project.workspaceId,
        userId
      );
      
      if (
        workspaceRole === WorkspaceRole.OWNER ||
        workspaceRole === WorkspaceRole.ADMIN
      ) {
        // Elevate all project permissions for workspace admins/owners
        return {
          canManageTasks: true,
          canCreateTasks: true,
          canDeleteTasks: true,
          canAssignTasks: true,
          canViewProject: true,
          canEditProject: true,
        };
      }

      // If they are a workspace member but not admin/owner, 
      // they might still have 'canViewProject' if they are a 'MEMBER' or 'VIEWER'
      if (workspaceRole) {
        permissions.canViewProject = true;
      }
    }

    return permissions;
  }
}
