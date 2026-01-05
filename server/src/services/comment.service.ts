import { db } from "../db/connection";
import { taskComments, tasks, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { RBACService } from "./rbac.service";
import { io } from "../index";

const rbacService = new RBACService();

export class CommentService {
  async createComment(taskId: string, content: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Get task to check permissions
      const [task] = await tx.select().from(tasks).where(eq(tasks.id, taskId));

      if (!task) {
        throw new Error("Task not found");
      }

      // Check if user can access project
      const canAccess = await rbacService.canAccessProject(
        task.projectId,
        userId
      );

      if (!canAccess) {
        throw new Error("No access to this task");
      }

      // Create comment
      const [newComment] = await tx
        .insert(taskComments)
        .values({
          taskId,
          userId,
          content,
        })
        .$returningId();

      // Fetch created comment with user details
      const [createdComment] = await tx
        .select({
          comment: taskComments,
          user: {
            id: users.id,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(taskComments)
        .innerJoin(users, eq(taskComments.userId, users.id))
        .where(eq(taskComments.id, newComment.id));

      // Emit real-time event
      io.to(`task:${taskId}`).emit("comment_added", {
        comment: createdComment,
        user: { userId },
      });

      // Also emit to project room for activity feed
      io.to(`project:${task.projectId}`).emit("project_activity", {
        type: "comment_added",
        taskId,
        comment: createdComment,
        userId,
        timestamp: new Date(),
      });

      return createdComment;
    });
  }

  async getTaskComments(taskId: string, userId: string) {
    // Get task to check permissions
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can access project
    const canAccess = await rbacService.canAccessProject(
      task.projectId,
      userId
    );

    if (!canAccess) {
      throw new Error("No access to this task");
    }

    // Fetch comments with user details
    const comments = await db
      .select({
        comment: taskComments,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(taskComments)
      .innerJoin(users, eq(taskComments.userId, users.id))
      .where(eq(taskComments.taskId, taskId))
      .orderBy(desc(taskComments.createdAt));

    return comments;
  }

  async updateComment(commentId: string, content: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Get comment
      const [comment] = await tx
        .select()
        .from(taskComments)
        .where(eq(taskComments.id, commentId));

      if (!comment) {
        throw new Error("Comment not found");
      }

      // Check if user owns the comment
      if (comment.userId !== userId) {
        throw new Error("You can only edit your own comments");
      }

      // Update comment
      await tx
        .update(taskComments)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(eq(taskComments.id, commentId));

      // Fetch updated comment
      const [updatedComment] = await tx
        .select({
          comment: taskComments,
          user: {
            id: users.id,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(taskComments)
        .innerJoin(users, eq(taskComments.userId, users.id))
        .where(eq(taskComments.id, commentId));

      // Emit real-time event
      io.to(`task:${comment.taskId}`).emit("comment_updated", {
        comment: updatedComment,
        user: { userId },
      });

      return updatedComment;
    });
  }

  async deleteComment(commentId: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Get comment
      const [comment] = await tx
        .select()
        .from(taskComments)
        .where(eq(taskComments.id, commentId));

      if (!comment) {
        throw new Error("Comment not found");
      }

      // Check if user owns the comment or is project lead
      if (comment.userId !== userId) {
        const [task] = await tx
          .select()
          .from(tasks)
          .where(eq(tasks.id, comment.taskId));
        const canManage = await rbacService.canPerformProjectAction(
          task.projectId,
          userId,
          "canManageTasks"
        );

        if (!canManage) {
          throw new Error("You can only delete your own comments");
        }
      }

      // Delete comment
      await tx.delete(taskComments).where(eq(taskComments.id, commentId));

      // Emit real-time event
      io.to(`task:${comment.taskId}`).emit("comment_deleted", {
        commentId,
        user: { userId },
      });

      return { success: true, commentId };
    });
  }
}
