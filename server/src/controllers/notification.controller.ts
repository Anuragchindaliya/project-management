
import { Request, Response } from 'express';
import { db } from '../db/connection';
import { notifications } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

export class NotificationController {
    
    async getNotifications(req: Request, res: Response) {
        try {
            // @ts-ignore - User populated by middleware
            const userId = req.user?.id || req.user?.userId;
            
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }

            const userNotifications = await db
                .select()
                .from(notifications)
                .where(eq(notifications.userId, userId))
                .orderBy(desc(notifications.createdAt))
                .limit(50);

            return res.json({
                success: true,
                data: userNotifications,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch notifications',
            });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user?.id || req.user?.userId;

            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }

            const [notification] = await db
                .select()
                .from(notifications)
                .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

            if (!notification) {
                return res.status(404).json({ success: false, error: 'Notification not found' });
            }

            await db
                .update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.id, id));

            return res.json({
                success: true,
                message: 'Notification marked as read',
            });
        } catch (error) {
             return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update notification',
            });
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
             // @ts-ignore
            const userId = req.user?.id || req.user?.userId;

            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }

            await db
                .update(notifications)
                .set({ isRead: true })
                .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

            return res.json({
                success: true,
                message: 'All notifications marked as read',
            });
        } catch (error) {
             return res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update notifications',
            });
        }
    }
}
