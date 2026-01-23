import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireProjectPermission } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  bulkUpdateTasksSchema,
  getTaskSchema,
  getProjectTasksSchema,
  deleteTaskSchema,
} from '../../validators/task.validator';
import { TaskController } from '../../controllers/task.controller';

const router = Router();
const taskController = new TaskController();

// All routes require authentication
router.use(authenticate);

// Task CRUD
router.post(
  '/projects/:projectId/tasks',
  requireProjectPermission('canCreateTasks'),
  validateRequest(createTaskSchema),
  taskController.createTask
);

router.get(
  '/projects/:projectId/tasks',
  validateRequest(getProjectTasksSchema),
  taskController.getProjectTasks
);

router.get('/tasks/:taskId', validateRequest(getTaskSchema), taskController.getTaskById);

router.patch('/tasks/:taskId', validateRequest(updateTaskSchema), taskController.updateTask);

router.delete('/tasks/:taskId', validateRequest(deleteTaskSchema), taskController.deleteTask);

// Bulk operations
router.patch(
  '/tasks/bulk-update',
  validateRequest(bulkUpdateTasksSchema),
  taskController.bulkUpdateTasks
);

// User tasks
router.get('/my-tasks', taskController.getUserTasks);

// Project statistics
router.get(
  '/projects/:projectId/stats',
  validateRequest(getProjectTasksSchema),
  taskController.getProjectStats
);

// Search Tasks (including Assigned To Me)
router.get('/', taskController.searchTasks);

export default router;
