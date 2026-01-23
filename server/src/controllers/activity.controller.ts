
import { Request, Response } from 'express';
import { db } from '../db/connection';
import { activityLogs, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class ActivityController {

    async getTaskActivity(req: Request, res: Response) {
        try {
            const { taskId } = req.params;

            if (!taskId) {
                return res.status(400).json({ success: false, error: "Task ID is required" });
            }

            const activities = await db
                .select({
                    id: activityLogs.id,
                    action: activityLogs.action,
                    entityType: activityLogs.entityType,
                    metadata: activityLogs.metadata,
                    createdAt: activityLogs.createdAt,
                    user: {
                        id: users.id,
                        username: users.username,
                        firstName: users.firstName,
                        lastName: users.lastName,
                        avatarUrl: users.avatarUrl,
                    }
                })
                .from(activityLogs)
                .leftJoin(users, eq(activityLogs.userId, users.id))
                .where(eq(activityLogs.taskId, taskId))
                .orderBy(desc(activityLogs.createdAt));

            return res.json({
                success: true,
                data: activities,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch task activity',
            });
        }
    }
}
