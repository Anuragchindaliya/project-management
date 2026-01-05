import { Request, Response } from 'express';
import { CommentService } from '../services';

const commentService = new CommentService();

export class CommentController {
  async createComment(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const userId = req.user!.userId;
      const { content } = req.body;

      const comment = await commentService.createComment(taskId, content, userId);

      return res.status(201).json({
        success: true,
        data: { comment },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create comment',
      });
    }
  }

  async getTaskComments(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const userId = req.user!.userId;

      const comments = await commentService.getTaskComments(taskId, userId);

      return res.json({
        success: true,
        data: { comments },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch comments',
      });
    }
  }

  async updateComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user!.userId;

      const comment = await commentService.updateComment(commentId, content, userId);

      return res.json({
        success: true,
        data: { comment },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update comment',
      });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = req.user!.userId;

      await commentService.deleteComment(commentId, userId);

      return res.json({
        success: true,
        message: 'Comment deleted',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete comment',
      });
    }
  }
}
