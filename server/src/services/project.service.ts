import { and, eq } from "drizzle-orm";
import { db } from "../db/connection";
import { projectMembers, projects, users } from "../db/schema";
import { ProjectRole } from "../types/rbac.types";
import { RBACService } from "./rbac.service";

export interface CreateProjectDTO {
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}
const rbacService = new RBACService();

export class ProjectService {
  // ============================================
  // CREATE PROJECT
  // ============================================
  async createProject(data: CreateProjectDTO, userId: string) {
    return await db.transaction(async (tx) => {
      // Check if user can create projects in workspace
      const canCreate = await rbacService.hasWorkspaceRole(
        data.workspaceId,
        userId,
        "member" as any
      );

      if (!canCreate) {
        throw new Error("Insufficient permissions to create project");
      }

      // Check if project key already exists in workspace
      const [existingProject] = await tx
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(
            eq(projects.workspaceId, data.workspaceId),
            eq(projects.key, data.key)
          )
        );

      if (existingProject) {
        throw new Error("Project key already exists in this workspace");
      }

      // Create project
      const [newProject] = await tx
        .insert(projects)
        .values({
          ...data,
          ownerId: userId,
        })
        .$returningId();

      // Fetch created project
      const [createdProject] = await tx
        .select()
        .from(projects)
        .where(eq(projects.id, newProject.id));

      // Add creator as project lead
      await tx.insert(projectMembers).values({
        projectId: createdProject.id,
        userId,
        role: "lead",
      });

      return createdProject;
    });
  }

  // ============================================
  // GET WORKSPACE PROJECTS
  // ============================================
  async getWorkspaceProjects(workspaceId: string, userId: string) {
    // Check if user has workspace access
    const hasAccess = await rbacService.hasWorkspaceRole(
      workspaceId,
      userId,
      "viewer" as any
    );

    if (!hasAccess) {
      throw new Error("No access to this workspace");
    }

    const workspaceProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    return workspaceProjects;
  }

  // ============================================
  // GET PROJECT BY ID
  // ============================================
  async getProjectById(projectId: string, userId: string) {
    const canAccess = await rbacService.canAccessProject(projectId, userId);

    if (!canAccess) {
      throw new Error("No access to this project");
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  }

  // ============================================
  // UPDATE PROJECT
  // ============================================
  async updateProject(
    projectId: string,
    data: Partial<CreateProjectDTO>,
    userId: string
  ) {
    const canEdit = await rbacService.canPerformProjectAction(
      projectId,
      userId,
      "canEditProject"
    );

    if (!canEdit) {
      throw new Error("Insufficient permissions to update project");
    }

    await db
      .update(projects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    const [updatedProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    return updatedProject;
  }

  // ============================================
  // DELETE PROJECT (with all related data)
  // ============================================
  async deleteProject(projectId: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Get project
      const [project] = await tx
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        throw new Error("Project not found");
      }

      // Check if user can delete (workspace admin/owner)
      const canDelete = await rbacService.hasWorkspaceRole(
        project.workspaceId,
        userId,
        "admin" as any
      );

      if (!canDelete) {
        throw new Error("Insufficient permissions to delete project");
      }

      // Delete project (tasks, comments, etc. will cascade)
      await tx.delete(projects).where(eq(projects.id, projectId));

      return { success: true, projectId };
    });
  }

  // ============================================
  // ADD PROJECT MEMBER
  // ============================================
  async addProjectMember(
    projectId: string,
    targetUserId: string,
    role: ProjectRole,
    adderId: string
  ) {
    return await db.transaction(async (tx) => {
      // Check permissions
      const canManage = await rbacService.canPerformProjectAction(
        projectId,
        adderId,
        "canEditProject"
      );

      if (!canManage) {
        throw new Error("Insufficient permissions to add project members");
      }

      // Check if already a member
      const [existing] = await tx
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, targetUserId)
          )
        );

      if (existing) {
        throw new Error("User is already a project member");
      }

      // Add member
      await tx.insert(projectMembers).values({
        projectId,
        userId: targetUserId,
        role,
      });

      return { success: true };
    });
  }

  // ============================================
  // GET PROJECT MEMBERS
  // ============================================
  async getProjectMembers(projectId: string, userId: string) {
    const canAccess = await rbacService.canAccessProject(projectId, userId);

    if (!canAccess) {
      throw new Error("No access to this project");
    }

    const members = await db
      .select({
        member: projectMembers,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId));

    return members;
  }

  async updateProjectMemberRole(
    projectId: string,
    targetUserId: string,
    newRole: "lead" | "developer" | "viewer",
    updaterId: string
  ) {
    return await db.transaction(async (tx) => {
      // Check if updater has permission
      const canEdit = await rbacService.canPerformProjectAction(
        projectId,
        updaterId,
        "canEditProject"
      );

      if (!canEdit) {
        throw new Error("Insufficient permissions to update member roles");
      }

      // Update role
      await tx
        .update(projectMembers)
        .set({ role: newRole })
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, targetUserId)
          )
        );

      return { success: true };
    });
  }

  async removeProjectMember(
    projectId: string,
    targetUserId: string,
    removerId: string
  ) {
    return await db.transaction(async (tx) => {
      // Check permissions
      const canEdit = await rbacService.canPerformProjectAction(
        projectId,
        removerId,
        "canEditProject"
      );

      if (!canEdit) {
        throw new Error("Insufficient permissions to remove project members");
      }

      // Cannot remove project owner
      const [project] = await tx
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (project.ownerId === targetUserId) {
        throw new Error("Cannot remove project owner");
      }

      // Remove from project
      await tx
        .delete(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, targetUserId)
          )
        );

      return { success: true };
    });
  }
}
