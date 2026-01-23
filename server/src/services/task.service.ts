import { db } from '../db/connection';
import {
  tasks,
  activityLogs,
  projects,
  taskComments,
  taskAttachments,
  users,
  Task,
} from '../db/schema';
import { eq, and, desc, sql, like, or } from 'drizzle-orm';
import { io } from '../index';
import { RBACService } from './rbac.service';

const rbacService = new RBACService();

export interface CreateTaskDTO {
  projectId: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  reporterId: string;
  parentTaskId?: string;
  estimatedHours?: number;
  dueDate?: Date;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  parentTaskId?: string;
  createdAt?: Date;
  // completedAt?: Date;
  completedAt?: Date | null;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
}

export interface SearchFilters {
  query: string;
  projectId?: string;
  workspaceId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
}

export class TaskService {
  // ... (keep all existing methods from previous artifact) ...
  async createTask(data: CreateTaskDTO, userId: string) {
    return await db.transaction(async (tx) => {
      // Check permissions
      const canCreate = await rbacService.canPerformProjectAction(
        data.projectId,
        userId,
        'canCreateTasks'
      );

      if (!canCreate) {
        throw new Error('Insufficient permissions to create task');
      }

      // Get next task number for this project
      const [result] = await tx
        .select({ maxNumber: sql<number>`COALESCE(MAX(${tasks.taskNumber}), 0)` })
        .from(tasks)
        .where(eq(tasks.projectId, data.projectId));

      const nextTaskNumber = (result?.maxNumber || 0) + 1;

      // Create task
      const [newTask] = await tx
        .insert(tasks)
        .values({
          ...data,
          taskNumber: nextTaskNumber,
        })
        .$returningId();

      // Fetch complete task with relations
      const [createdTask] = await tx.select().from(tasks).where(eq(tasks.id, newTask.id));

      // Log activity
      await tx.insert(activityLogs).values({
        projectId: data.projectId,
        taskId: createdTask.id,
        userId,
        action: 'task_created',
        entityType: 'task',
        metadata: JSON.stringify({
          title: createdTask.title,
          status: createdTask.status,
        }),
      });

      // Emit real-time event
      io.to(`project:${data.projectId}`).emit('task_created', {
        task: createdTask,
        user: { userId },
      });

      return createdTask;
    });
  }

  // ============================================
  // UPDATE TASK
  // ============================================

  async updateTask(taskId: string, data: UpdateTaskDTO, userId: string) {
    return await db.transaction(async (tx) => {
      // Get current task
      const [currentTask] = await tx.select().from(tasks).where(eq(tasks.id, taskId));

      if (!currentTask) {
        throw new Error('Task not found');
      }

      // Check permissions
      const canManage = await rbacService.canPerformProjectAction(
        currentTask.projectId,
        userId,
        'canManageTasks'
      );

      if (!canManage) {
        throw new Error('Insufficient permissions to update task');
      }

      // Track changes for activity log
      const changes: Record<string, { from: any; to: any }> = {};

      if (data.status && data.status !== currentTask.status) {
        changes.status = { from: currentTask.status, to: data.status };
      }

      if (data.assigneeId && data.assigneeId !== currentTask.assigneeId) {
        changes.assignee = { from: currentTask.assigneeId, to: data.assigneeId };
      }

      if (data.priority && data.priority !== currentTask.priority) {
        changes.priority = { from: currentTask.priority, to: data.priority };
      }

      // Auto-set completedAt if status changed to 'done'
      const updateData = { ...data };
      if (data.status === 'done' && currentTask.status !== 'done') {
        updateData.completedAt = new Date();
      } else if (data.status && data.status !== 'done') {
        updateData.completedAt = null;
      }

      // Update task
      await tx
        .update(tasks)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      // Fetch updated task
      const [updatedTask] = await tx.select().from(tasks).where(eq(tasks.id, taskId));

      // Log activity for each change
      if (Object.keys(changes).length > 0) {
        for (const [field, change] of Object.entries(changes)) {
          await tx.insert(activityLogs).values({
            projectId: currentTask.projectId,
            taskId,
            userId,
            action: `task_${field}_changed`,
            entityType: 'task',
            metadata: JSON.stringify({
              field,
              from: change.from,
              to: change.to,
            }),
          });
        }
      }

      // Emit real-time event
      io.to(`project:${currentTask.projectId}`).emit('task_updated', {
        task: updatedTask,
        changes,
        user: { userId },
      });

      // If assignee changed, notify the new assignee
      if (data.assigneeId && data.assigneeId !== currentTask.assigneeId) {
        io.to(`user:${data.assigneeId}`).emit('task_assigned', {
          task: updatedTask,
          assignedBy: userId,
        });
      }

      return updatedTask;
    });
  }

  // ============================================
  // DELETE TASK
  // ============================================

  async deleteTask(taskId: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Get task
      const [task] = await tx.select().from(tasks).where(eq(tasks.id, taskId));

      if (!task) {
        throw new Error('Task not found');
      }

      // Check permissions
      const canDelete = await rbacService.canPerformProjectAction(
        task.projectId,
        userId,
        'canDeleteTasks'
      );

      if (!canDelete) {
        throw new Error('Insufficient permissions to delete task');
      }

      // Check for subtasks
      const subtasks = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.parentTaskId, taskId));

      if (subtasks.length > 0) {
        throw new Error('Cannot delete task with subtasks. Delete subtasks first.');
      }

      // Log activity before deletion
      await tx.insert(activityLogs).values({
        projectId: task.projectId,
        taskId,
        userId,
        action: 'task_deleted',
        entityType: 'task',
        metadata: JSON.stringify({
          title: task.title,
          taskNumber: task.taskNumber,
        }),
      });

      // Delete task (comments and attachments will cascade)
      await tx.delete(tasks).where(eq(tasks.id, taskId));

      // Emit real-time event
      io.to(`project:${task.projectId}`).emit('task_deleted', {
        taskId,
        user: { userId },
      });

      return { success: true, taskId };
    });
  }

  // ============================================
  // BULK UPDATE TASKS (For Drag & Drop)
  // ============================================

  async bulkUpdateTaskStatus(
    updates: Array<{ taskId: string; status: string; position?: number }>,
    userId: string
  ) {
    return await db.transaction(async (tx) => {
      const updatedTasks = [];

      for (const update of updates) {
        const [task]: any = await tx.select().from(tasks).where(eq(tasks.id, update.taskId));

        if (!task) continue;

        // Check permissions
        const canManage = await rbacService.canPerformProjectAction(
          task.projectId,
          userId,
          'canManageTasks'
        );

        if (!canManage) continue;

        // Update task
        await tx
          .update(tasks)
          .set({
            status: update.status as any,
            updatedAt: new Date(),
          })
          .where(eq(tasks.id, update.taskId));

        // Log activity
        await tx.insert(activityLogs).values({
          projectId: task.projectId,
          taskId: update.taskId,
          userId,
          action: 'task_status_changed',
          entityType: 'task',
          metadata: JSON.stringify({
            from: task.status,
            to: update.status,
          }),
        });

        updatedTasks.push({ ...task, status: update.status });
      }

      // Emit single real-time event for bulk update
      if (updatedTasks.length > 0) {
        const projectId = updatedTasks[0].projectId;
        io.to(`project:${projectId}`).emit('tasks_bulk_updated', {
          tasks: updatedTasks,
          user: { userId },
        });
      }

      return updatedTasks;
    });
  }

  // ============================================
  // GET TASK BY ID WITH DETAILS
  // ============================================

  async getTaskById(taskId: string, userId: string) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user can access project
    const canAccess = await rbacService.canAccessProject(task.projectId, userId);

    if (!canAccess) {
      throw new Error('No access to this task');
    }

    return task;
  }

  // ============================================
  // ASSIGN TASK
  // ============================================

  async assignTask(taskId: string, assigneeId: string, userId: string) {
    return this.updateTask(taskId, { assigneeId }, userId);
  }

  // ============================================
  // GET TASK STATISTICS
  // ============================================

  async getProjectTaskStats(projectId: string, userId: string) {
    // Check permissions
    const canAccess = await rbacService.canAccessProject(projectId, userId);

    if (!canAccess) {
      throw new Error('No access to this project');
    }

    const stats = await db
      .select({
        status: tasks.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .groupBy(tasks.status);

    return {
      total: stats.reduce((sum, stat) => sum + stat.count, 0),
      byStatus: stats.reduce(
        (acc, stat) => {
          acc[stat.status] = stat.count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  // ============================================
  // GET TASKS BY PROJECT WITH FILTERS
  // ============================================
  async getTasksByProject(projectId: string, userId: string, filters?: TaskFilters) {
    const canAccess = await rbacService.canAccessProject(projectId, userId);

    if (!canAccess) {
      throw new Error('No access to this project');
    }

    const conditions = [eq(tasks.projectId, projectId)];

    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status as any));
    }

    if (filters?.priority) {
      conditions.push(eq(tasks.priority, filters.priority as any));
    }

    if (filters?.assigneeId) {
      conditions.push(eq(tasks.assigneeId, filters.assigneeId));
    }

    const projectTasks = await db
      .select({
        task: tasks,
        assignee: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt));

    return projectTasks;
  }

  // ============================================
  // GET USER TASKS WITH FILTERS
  // ============================================
  async getUserTasks(userId: string, filters?: TaskFilters) {
    const conditions = [eq(tasks.assigneeId, userId)];

    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status as any));
    }

    if (filters?.priority) {
      conditions.push(eq(tasks.priority, filters.priority as any));
    }

    const userTasks = await db
      .select({
        task: tasks,
        project: {
          id: projects.id,
          name: projects.name,
          key: projects.key,
          workspaceId: projects.workspaceId,
        },
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt));

    return userTasks;
  }

  // ============================================
  // GET TASK WITH FULL DETAILS
  // ============================================
  async getTaskWithDetails(taskId: string, userId: string) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task) {
      throw new Error('Task not found');
    }

    const canAccess = await rbacService.canAccessProject(task.projectId, userId);

    if (!canAccess) {
      throw new Error('No access to this task');
    }

    // Get task with assignee and reporter
    const [taskWithUsers] = await db
      .select({
        task: tasks,
        assignee: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.id, taskId));

    // Get reporter separately
    const [reporter] = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, task.reporterId));

    // Get comments
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

    // Get attachments
    const attachments = await db
      .select()
      .from(taskAttachments)
      .where(eq(taskAttachments.taskId, taskId))
      .orderBy(desc(taskAttachments.createdAt));

    // Get subtasks
    const subtasks = await db.select().from(tasks).where(eq(tasks.parentTaskId, taskId));

    return {
      task: taskWithUsers.task,
      assignee: taskWithUsers.assignee,
      reporter,
      comments,
      attachments,
      subtasks,
    };
  }

  // ============================================
  // SEARCH TASKS
  // ============================================
  async searchTasks(userId: string, filters: SearchFilters) {
    const conditions = [];

    // Text search in title and description
    if (filters.query) {
      conditions.push(
        or(like(tasks.title, `%${filters.query}%`), like(tasks.description, `%${filters.query}%`))
      );
    }

    if (filters.projectId) {
      conditions.push(eq(tasks.projectId, filters.projectId));
    }

    if (filters.status) {
      conditions.push(eq(tasks.status, filters.status as any));
    }

    if (filters.priority) {
      conditions.push(eq(tasks.priority, filters.priority as any));
    }

    // NEW: Filter by assigneeId
    if (filters.assigneeId) {
      conditions.push(eq(tasks.assigneeId, filters.assigneeId));
    }

    let query = db
      .select({
        task: tasks,
        project: {
          id: projects.id,
          name: projects.name,
          key: projects.key,
          workspaceId: projects.workspaceId,
        },
        assignee: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        }
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assigneeId, users.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(tasks.updatedAt)).limit(50);

    // Filter by workspace if specified
    if (filters.workspaceId) {
      return results.filter((r) => r.project.workspaceId === filters.workspaceId);
    }

    // Filter by user access
    const accessibleResults = [];
    for (const result of results) {
      const canAccess = await rbacService.canAccessProject(result.project.id, userId);
      if (canAccess) {
        accessibleResults.push(result);
      }
    }

    return accessibleResults;
  }
}
