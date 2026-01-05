import { taskAttachments, tasks, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { RBACService } from './rbac.service';
import { db } from '../db/connection';
import { io } from '..';

interface CreateAttachmentDTO {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType?: string;
}
const rbacService = new RBACService();

export class AttachmentService {
  async createAttachment(taskId: string, data: CreateAttachmentDTO, userId: string) {
    return await db.transaction(async (tx) => {
      // Get task to check permissions
      const [task] = await tx.select().from(tasks).where(eq(tasks.id, taskId));

      if (!task) {
        throw new Error('Task not found');
      }

      // Check if user can access project
      const canAccess = await rbacService.canAccessProject(task.projectId, userId);

      if (!canAccess) {
        throw new Error('No access to this task');
      }

      // Create attachment
      const [newAttachment] = await tx
        .insert(taskAttachments)
        .values({
          taskId,
          uploadedBy: userId,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
        })
        .$returningId();

      // Fetch created attachment
      const [createdAttachment] = await tx
        .select()
        .from(taskAttachments)
        .where(eq(taskAttachments.id, newAttachment.id));

      // Emit real-time event
      io.to(`task:${taskId}`).emit('attachment_added', {
        attachment: createdAttachment,
        user: { userId },
      });

      return createdAttachment;
    });
  }

  async getTaskAttachments(taskId: string, userId: string) {
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

    // Fetch attachments with uploader details
    const attachments = await db
      .select({
        attachment: taskAttachments,
        uploader: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(taskAttachments)
      .innerJoin(users, eq(taskAttachments.uploadedBy, users.id))
      .where(eq(taskAttachments.taskId, taskId))
      .orderBy(desc(taskAttachments.createdAt));

    return attachments;
  }

  async deleteAttachment(attachmentId: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Get attachment
      const [attachment] = await tx
        .select()
        .from(taskAttachments)
        .where(eq(taskAttachments.id, attachmentId));

      if (!attachment) {
        throw new Error('Attachment not found');
      }

      // Check if user uploaded the file or is project lead
      if (attachment.uploadedBy !== userId) {
        const [task] = await tx.select().from(tasks).where(eq(tasks.id, attachment.taskId));
        const canManage = await rbacService.canPerformProjectAction(
          task.projectId,
          userId,
          'canManageTasks'
        );

        if (!canManage) {
          throw new Error('You can only delete your own attachments');
        }
      }

      // Delete attachment
      await tx.delete(taskAttachments).where(eq(taskAttachments.id, attachmentId));

      // Emit real-time event
      io.to(`task:${attachment.taskId}`).emit('attachment_deleted', {
        attachmentId,
        user: { userId },
      });

      // Note: In production, you should also delete the file from storage (S3, etc.)
      // await deleteFileFromStorage(attachment.fileUrl);

      return { success: true, attachmentId };
    });
  }
}
