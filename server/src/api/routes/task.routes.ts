import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireProjectPermission } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  updateTaskSchema,
  bulkUpdateTasksSchema,
  getTaskSchema,
  getProjectTasksSchema,
  deleteTaskSchema,
} from '../../validators/task.validator';
import {
  createCommentSchema,
  getTaskCommentsSchema,
} from '../../validators/comment.validator';
import { TaskController } from '../../controllers/task.controller';
import { CommentController } from '../../controllers/comment.controller';

const router = Router();
const taskController = new TaskController();
const commentController = new CommentController();

// All routes require authentication
router.use(authenticate);

// Bulk operations (Must be before /:taskId to avoid conflict)
router.patch(
  '/bulk-update',
  validateRequest(bulkUpdateTasksSchema),
  taskController.bulkUpdateTasks
);

// User tasks
router.get('/my-tasks', taskController.getUserTasks);

// Search Tasks
router.get('/', taskController.searchTasks);

// Task CRUD operations
router.get('/:taskId', validateRequest(getTaskSchema), taskController.getTaskById);

router.patch('/:taskId', validateRequest(updateTaskSchema), taskController.updateTask);

router.delete('/:taskId', validateRequest(deleteTaskSchema), taskController.deleteTask);

// Task Assignment
router.patch('/:taskId/assign', taskController.assignTask);

// Task Comments
router.post(
  '/:taskId/comments',
  validateRequest(createCommentSchema),
  commentController.createComment
);

router.get(
  '/:taskId/comments',
  validateRequest(getTaskCommentsSchema),
  commentController.getTaskComments
);

export default router;
