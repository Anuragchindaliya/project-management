import { db } from "../db/connection";
import { workspaces, workspaceMembers, projects, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { RBACService } from "./rbac.service";

const rbacService = new RBACService();

export interface CreateWorkspaceDTO {
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
}

export class WorkspaceService {
  // ============================================
  // CREATE WORKSPACE
  // ============================================
  async createWorkspace(data: CreateWorkspaceDTO, userId: string) {
    return await db.transaction(async (tx) => {
      // Check if slug already exists
      const [existingWorkspace] = await tx
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, data.slug));

      if (existingWorkspace) {
        throw new Error("Workspace slug already exists");
      }

      // Create workspace
      const [newWorkspace] = await tx
        .insert(workspaces)
        .values({
          ...data,
          ownerId: userId,
        })
        .$returningId();

      // Fetch created workspace
      const [createdWorkspace] = await tx
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, newWorkspace.id));

      // Add creator as owner
      await tx.insert(workspaceMembers).values({
        workspaceId: createdWorkspace.id,
        userId,
        role: "owner",
      });

      return createdWorkspace;
    });
  }

  // ============================================
  // GET USER WORKSPACES
  // ============================================
  async getUserWorkspaces(userId: string) {
    const userWorkspaces = await db
      .select({
        workspace: workspaces,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId));

    return userWorkspaces;
  }

  // ============================================
  // GET WORKSPACE BY ID
  // ============================================
  async getWorkspaceById(workspaceId: string, userId: string) {
    // Check if user has access
    const hasAccess = await rbacService.hasWorkspaceRole(
      workspaceId,
      userId,
      "viewer" as any
    );

    if (!hasAccess) {
      throw new Error("No access to this workspace");
    }

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return workspace;
  }

  // ============================================
  // UPDATE WORKSPACE
  // ============================================
  async updateWorkspace(
    workspaceId: string,
    data: Partial<CreateWorkspaceDTO>,
    userId: string
  ) {
    // Check permissions (only admins and owners can update)
    const hasAccess = await rbacService.hasWorkspaceRole(
      workspaceId,
      userId,
      "admin" as any
    );

    if (!hasAccess) {
      throw new Error("Insufficient permissions to update workspace");
    }

    await db
      .update(workspaces)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId));

    const [updatedWorkspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    return updatedWorkspace;
  }

  // ============================================
  // ADD WORKSPACE MEMBER
  // ============================================
  async addWorkspaceMember(
    workspaceId: string,
    targetUserId: string,
    role: "admin" | "member" | "viewer",
    inviterId: string
  ) {
    return await db.transaction(async (tx) => {
      // Check if inviter has permission
      const hasPermission = await rbacService.hasWorkspaceRole(
        workspaceId,
        inviterId,
        "admin" as any
      );

      if (!hasPermission) {
        throw new Error("Insufficient permissions to add members");
      }

      // Check if user already a member
      const [existing] = await tx
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, targetUserId)
          )
        );

      if (existing) {
        throw new Error("User is already a workspace member");
      }

      // Add member
      await tx.insert(workspaceMembers).values({
        workspaceId,
        userId: targetUserId,
        role,
        invitedBy: inviterId,
      });

      return { success: true };
    });
  }

  // ============================================
  // UPDATE MEMBER ROLE
  // ============================================
  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    newRole: "admin" | "member" | "viewer",
    updaterId: string
  ) {
    // Check if updater has permission (must be admin or owner)
    const hasPermission = await rbacService.hasWorkspaceRole(
      workspaceId,
      updaterId,
      "admin" as any
    );

    if (!hasPermission) {
      throw new Error("Insufficient permissions to update member roles");
    }

    // Cannot change workspace owner role
    const [workspace] = await db
      .select({ ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (workspace.ownerId === targetUserId) {
      throw new Error("Cannot change workspace owner role");
    }

    await db
      .update(workspaceMembers)
      .set({ role: newRole })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUserId)
        )
      );

    return { success: true };
  }

  // ============================================
  // REMOVE MEMBER
  // ============================================
  async removeMember(
    workspaceId: string,
    targetUserId: string,
    removerId: string
  ) {
    return await db.transaction(async (tx) => {
      // Check permissions
      const hasPermission = await rbacService.hasWorkspaceRole(
        workspaceId,
        removerId,
        "admin" as any
      );

      if (!hasPermission) {
        throw new Error("Insufficient permissions to remove members");
      }

      // Cannot remove workspace owner
      const [workspace] = await tx
        .select({ ownerId: workspaces.ownerId })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId));

      if (workspace.ownerId === targetUserId) {
        throw new Error("Cannot remove workspace owner");
      }

      // Remove from workspace
      await tx
        .delete(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, targetUserId)
          )
        );

      return { success: true };
    });
  }

  // ============================================
  // GET WORKSPACE MEMBERS
  // ============================================
  async getWorkspaceMembers(workspaceId: string, userId: string) {
    // Check if user has access
    const hasAccess = await rbacService.hasWorkspaceRole(
      workspaceId,
      userId,
      "viewer" as any
    );

    if (!hasAccess) {
      throw new Error("No access to this workspace");
    }

    const members = await db
      .select({
        member: workspaceMembers,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return members;
  }
}
