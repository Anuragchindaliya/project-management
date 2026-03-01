import { db } from "../db/connection";
import { accessRequests, projectMembers, workspaceMembers, projects, users } from "../db/schema";
import { eq, and, desc, inArray, or, isNull } from "drizzle-orm";
import { ProjectRole, WorkspaceRole } from "../types/rbac.types";
import * as crypto from "crypto";
// ... (omitting middle parts for clarity if needed, but I'll provide full replacement of the method)

export interface CreateAccessRequestDTO {
  projectId?: string;
  workspaceId: string;
  requestedRole: string;
  message?: string;
}

export class AccessRequestService {
  async createRequest(data: CreateAccessRequestDTO, userId: string) {
    // Check if a pending request already exists
    const [existing] = await db
      .select()
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.userId, userId),
          eq(accessRequests.workspaceId, data.workspaceId),
          data.projectId ? eq(accessRequests.projectId, data.projectId) : isNull(accessRequests.projectId),
          eq(accessRequests.status, "pending")
        )
      );

    if (existing) {
      throw new Error("You already have a pending access request for this project/workspace");
    }

    const requestId = crypto.randomUUID();
    await db.insert(accessRequests).values({
      id: requestId,
      ...data,
      userId,
    });

    const [request] = await db.select().from(accessRequests).where(eq(accessRequests.id, requestId));
    return request;
  }

  async getPendingRequestsForOwner(userId: string) {
    // Get workspaces where user is admin or owner
    const adminWorkspaces = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          or(
            eq(workspaceMembers.role, WorkspaceRole.ADMIN as any),
            eq(workspaceMembers.role, WorkspaceRole.OWNER as any)
          )
        )
      );
    
    if (adminWorkspaces.length === 0) return [];

    const workspaceIds = adminWorkspaces.map(w => w.workspaceId);

    // Get all pending requests for these workspaces
    const requests = await db
      .select({
        request: accessRequests,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        project: {
          id: projects.id,
          name: projects.name,
        }
      })
      .from(accessRequests)
      .innerJoin(users, eq(accessRequests.userId, users.id))
      .leftJoin(projects, eq(accessRequests.projectId, projects.id))
      .where(
        and(
          inArray(accessRequests.workspaceId, workspaceIds),
          eq(accessRequests.status, "pending")
        )
      )
      .orderBy(desc(accessRequests.createdAt));

    return requests;
  }

  async processRequest(requestId: string, status: 'approved' | 'rejected', userId: string) {
    return await db.transaction(async (tx) => {
      const [request] = await tx
        .select()
        .from(accessRequests)
        .where(eq(accessRequests.id, requestId));

      if (!request) throw new Error("Request not found");
      if (request.status !== 'pending') throw new Error("Request already processed");

      // Verify if user is admin/owner of the workspace
      const [membership] = await tx
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, request.workspaceId),
            eq(workspaceMembers.userId, userId),
            or(
              eq(workspaceMembers.role, WorkspaceRole.ADMIN as any),
              eq(workspaceMembers.role, WorkspaceRole.OWNER as any)
            )
          )
        );

      if (!membership) throw new Error("Unauthorized to process this request");

      // Update request status
      await tx
        .update(accessRequests)
        .set({ status, updatedAt: new Date() })
        .where(eq(accessRequests.id, requestId));

      if (status === 'approved') {
        const role = request.requestedRole;

        if (request.projectId) {
          // Add to project
          await tx.insert(projectMembers).values({
            projectId: request.projectId,
            userId: request.userId,
            role: role as ProjectRole,
          });
        } else {
          // Add to workspace
          await tx.insert(workspaceMembers).values({
            workspaceId: request.workspaceId,
            userId: request.userId,
            role: role as WorkspaceRole,
          });
        }
      }

      return { success: true };
    });
  }
}
