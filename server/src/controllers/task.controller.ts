import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

const taskService = new TaskService();

export class TaskController {
  // ============================================
  // CREATE TASK
  // ============================================
  async createTask(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { projectId } = req.params;

      const task = await taskService.createTask(
        { ...req.body, projectId, reporterId: userId },
        userId
      );

      return res.status(201).json({
        success: true,
        data: { task },
        message: 'Task created successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      });
    }
  }

  // ============================================
  // GET PROJECT TASKS
  // ============================================
  async getProjectTasks(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user!.userId;
      const { status, priority, assigneeId } = req.query;

      const tasks = await taskService.getTasksByProject(projectId, userId, {
        status: status as string | undefined,
        priority: priority as string | undefined,
        assigneeId: assigneeId as string | undefined,
      });

      return res.json({
        success: true,
        data: { tasks, count: tasks.length },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      });
    }
  }

  // ============================================
  // GET TASK BY ID
  // ============================================
  async getTaskById(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const userId = req.user!.userId;

      const task = await taskService.getTaskById(taskId, userId);

      return res.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Task not found',
      });
    }
  }

  // ============================================
  // UPDATE TASK
  // ============================================
  async updateTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const userId = req.user!.userId;

      const task = await taskService.updateTask(taskId, req.body, userId);

      return res.json({
        success: true,
        data: { task },
        message: 'Task updated successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      });
    }
  }

  // ============================================
  // DELETE TASK
  // ============================================
  async deleteTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const userId = req.user!.userId;

      await taskService.deleteTask(taskId, userId);

      return res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      });
    }
  }

  // ============================================
  // BULK UPDATE TASKS (Drag & Drop)
  // ============================================
  async bulkUpdateTasks(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { updates } = req.body;

      const tasks = await taskService.bulkUpdateTaskStatus(updates, userId);

      return res.json({
        success: true,
        data: { tasks, count: tasks.length },
        message: 'Tasks updated successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tasks',
      });
    }
  }

  // ============================================
  // GET USER'S ASSIGNED TASKS
  // ============================================
  async getUserTasks(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { status, priority } = req.query;

      const tasks = await taskService.getUserTasks(userId, {
        status: status as string | undefined,
        priority: priority as string | undefined,
      });

      return res.json({
        success: true,
        data: { tasks, count: tasks.length },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch user tasks',
      });
    }
  }

  // ============================================
  // GET PROJECT STATISTICS
  // ============================================
  async getProjectStats(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user!.userId;

      const stats = await taskService.getProjectTaskStats(projectId, userId);

      return res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch project statistics',
      });
    }
  }

  // ============================================
  // ASSIGN TASK TO USER
  // ============================================
  async assignTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const { assigneeId } = req.body;
      const userId = req.user!.userId;

      const task = await taskService.assignTask(taskId, assigneeId, userId);

      return res.json({
        success: true,
        data: { task },
        message: 'Task assigned successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign task',
      });
    }
  }

  // ============================================
  // GET TASK WITH FULL DETAILS (includes comments, attachments)
  // ============================================
  async getTaskDetails(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const userId = req.user!.userId;

      const taskDetails = await taskService.getTaskWithDetails(taskId, userId);

      return res.json({
        success: true,
        data: taskDetails,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Task not found',
      });
    }
  }

  // ============================================
  // SEARCH TASKS
  // ============================================
  async searchTasks(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { query, projectId, workspaceId, status, priority, assigneeId } = req.query;

      const tasks = await taskService.searchTasks(userId, {
        query: query as string,
        projectId: projectId as string | undefined,
        workspaceId: workspaceId as string | undefined,
        status: status as string | undefined,
        priority: priority as string | undefined,
        assigneeId: assigneeId as string | undefined,
      });

      return res.json({
        success: true,
        data: { tasks, count: tasks.length },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to search tasks',
      });
    }
  }
}
