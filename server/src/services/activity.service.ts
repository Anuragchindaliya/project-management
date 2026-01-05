import { eq, desc } from 'drizzle-orm';
import { activityLogs, tasks, users } from '../db/schema';
import { RBACService } from './rbac.service';
import { db } from '../db/connection';
const rbacService = new RBACService();
export class ActivityService {
  async getWorkspaceActivity(
    workspaceId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    // Check if user has access to workspace
    const hasAccess = await rbacService.hasWorkspaceRole(workspaceId, userId, 'viewer' as any);

    if (!hasAccess) {
      throw new Error('No access to this workspace');
    }

    // Fetch activity logs with user details
    const activities = await db
      .select({
        activity: activityLogs,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.workspaceId, workspaceId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return activities;
  }

  async getProjectActivity(
    projectId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    // Check if user has access to project
    const canAccess = await rbacService.canAccessProject(projectId, userId);

    if (!canAccess) {
      throw new Error('No access to this project');
    }

    // Fetch activity logs with user details
    const activities = await db
      .select({
        activity: activityLogs,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.projectId, projectId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return activities;
  }

  async getTaskActivity(taskId: string, userId: string, limit: number = 50, offset: number = 0) {
    // Get task to check permissions
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user can access project
    const canAccess = await rbacService.canAccessProject(task.projectId, userId);

    if (!canAccess) {
      throw new Error('No access to this task');
    }

    // Fetch activity logs with user details
    const activities = await db
      .select({
        activity: activityLogs,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.taskId, taskId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return activities;
  }

  async getUserActivity(userId: string, limit: number = 50, offset: number = 0) {
    // Fetch user's activity logs
    const activities = await db
      .select({
        activity: activityLogs,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return activities;
  }
}
