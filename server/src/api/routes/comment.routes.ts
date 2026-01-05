import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  getTaskCommentsSchema,
} from '../../validators/comment.validator';
import { CommentController } from '../../controllers/comment.controller';

const router = Router();
const commentController = new CommentController();

// All routes require authentication
router.use(authenticate);

// Comment CRUD
router.post(
  '/tasks/:taskId/comments',
  validateRequest(createCommentSchema),
  commentController.createComment
);

router.get(
  '/tasks/:taskId/comments',
  validateRequest(getTaskCommentsSchema),
  commentController.getTaskComments
);

router.patch(
  '/comments/:commentId',
  validateRequest(updateCommentSchema),
  commentController.updateComment
);

router.delete(
  '/comments/:commentId',
  validateRequest(deleteCommentSchema),
  commentController.deleteComment
);

export default router;
