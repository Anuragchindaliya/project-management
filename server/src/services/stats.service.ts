import { db } from "../db/connection";
import { tasks, projects, workspaceMembers, activityLogs } from "../db/schema";
import { eq, and, sql, desc, lt, ne } from "drizzle-orm";

export class StatsService {
  async getDashboardStats(userId: string) {
    // 1. Get all projects user is a member of (or has access to via workspace)
    // For simplicity, let's look at projects where user is a member or owner.
    // Actually, dashboard usually shows "My Work" or "My Workspace Overview".
    // Let's aggregate across all workspaces the user is part of.

    /*
      Metrics requested:
      - Tasks Completed (count)
      - Overdue Tasks (count)
      - Total Tasks (count) - for progress
    */

    // Fetch total assigned tasks
    const [totalTasksResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.assigneeId, userId));

    const totalTasks = totalTasksResult.count;

    // Fetch completed tasks
    const [completedTasksResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeId, userId),
          eq(tasks.status, 'done')
        )
      );

    const completedTasks = completedTasksResult.count;

    // Fetch overdue tasks
    const [overdueTasksResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeId, userId),
          ne(tasks.status, 'done'),
          lt(tasks.dueDate, new Date())
        )
      );

    const overdueTasks = overdueTasksResult.count;

    // Fetch tasks by priority (Group By)
    const tasksByPriority = await db
      .select({
        priority: tasks.priority,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .where(eq(tasks.assigneeId, userId))
      .groupBy(tasks.priority);

    // Recent Activity (across projects user is in)
    // This is complex if we strictly check project membership.
    // Let's fetch logs for projects user is a member of.
    // Simplified: Fetch logs where user is the actor? Or logs relevant to user?
    // Let's return logs where user is the ACTOR for now as "My Recent Activity".
    const recentActivity = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(5);

    return {
      hasData: totalTasks > 0,
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByPriority: tasksByPriority.reduce((acc, curr) => {
        acc[curr.priority] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      recentActivity
    };
  }
}
