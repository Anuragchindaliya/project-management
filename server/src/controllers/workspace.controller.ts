import { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspace.service';

const workspaceService = new WorkspaceService();

export class WorkspaceController {
  async createWorkspace(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const workspace = await workspaceService.createWorkspace(req.body, userId);

      return res.status(201).json({
        success: true,
        data: { workspace },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workspace',
      });
    }
  }

  async getUserWorkspaces(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const workspaces = await workspaceService.getUserWorkspaces(userId);

      return res.json({
        success: true,
        data: { workspaces },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch workspaces',
      });
    }
  }

  async getWorkspaceById(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.userId;

      const workspace = await workspaceService.getWorkspaceById(workspaceId, userId);

      return res.json({
        success: true,
        data: { workspace },
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Workspace not found',
      });
    }
  }

  async updateWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.userId;

      const workspace = await workspaceService.updateWorkspace(workspaceId, req.body, userId);

      return res.json({
        success: true,
        data: { workspace },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update workspace',
      });
    }
  }

  async deleteWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.userId;

      await workspaceService.deleteWorkspace(workspaceId, userId);

      return res.json({
        success: true,
        message: 'Workspace deleted successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete workspace',
      });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      const { userId: targetUserId, role } = req.body;
      const inviterId = req.user!.userId;

      await workspaceService.addWorkspaceMember(workspaceId, targetUserId, role, inviterId);

      return res.status(201).json({
        success: true,
        message: 'Member added successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add member',
      });
    }
  }

  async updateMemberRole(req: Request, res: Response) {
    try {
      const { workspaceId, userId: targetUserId } = req.params;
      const { role } = req.body;
      const updaterId = req.user!.userId;

      await workspaceService.updateMemberRole(workspaceId, targetUserId, role, updaterId);

      return res.json({
        success: true,
        message: 'Member role updated',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update role',
      });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { workspaceId, userId: targetUserId } = req.params;
      const removerId = req.user!.userId;

      await workspaceService.removeMember(workspaceId, targetUserId, removerId);

      return res.json({
        success: true,
        message: 'Member removed',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove member',
      });
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.userId;

      const members = await workspaceService.getWorkspaceMembers(workspaceId, userId);

      return res.json({
        success: true,
        data: { members },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch members',
      });
    }
  }
}
