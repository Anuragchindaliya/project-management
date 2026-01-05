import { Request, Response, NextFunction } from 'express';
import { RBACService } from '../services/rbac.service';
import {
  WorkspaceRole,
  ProjectRole,
  WorkspacePermissions,
  ProjectPermissions,
} from '../types/rbac.types';

const rbacService = new RBACService();

// ============================================
// WORKSPACE RBAC MIDDLEWARE
// ============================================

export const requireWorkspaceAccess = (minRole: WorkspaceRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const workspaceId = req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: 'Workspace ID is required',
        });
      }

      const hasAccess = await rbacService.hasWorkspaceRole(workspaceId, userId, minRole);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: minRole,
        });
      }

      // Attach workspace role to request for future use
      const userRole = await rbacService.getUserWorkspaceRole(workspaceId, userId);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          error: 'Not a workspace member',
        });
      }

      req.user!.workspaceRole = userRole;

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Permission check failed',
      });
    }
  };
};

export const requireWorkspacePermission = (permission: keyof WorkspacePermissions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const workspaceId = req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: 'Workspace ID is required',
        });
      }

      const userRole = await rbacService.getUserWorkspaceRole(workspaceId, userId);

      if (!userRole) {
        return res.status(403).json({
          success: false,
          error: 'Not a workspace member',
        });
      }

      const permissions = rbacService.getWorkspacePermissions(userRole);

      if (!permissions[permission]) {
        return res.status(403).json({
          success: false,
          error: `Missing permission: ${permission}`,
        });
      }

      req.user!.workspaceRole = userRole;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Permission check failed',
      });
    }
  };
};

// ============================================
// PROJECT RBAC MIDDLEWARE
// ============================================

export const requireProjectAccess = (minRole: ProjectRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const projectId = req.params.projectId || req.body.projectId;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
      }

      // Check if user can access project
      const canAccess = await rbacService.canAccessProject(projectId, userId);

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          error: 'No access to this project',
        });
      }

      // Check role level
      const hasRole = await rbacService.hasProjectRole(projectId, userId, minRole);

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient project permissions',
          required: minRole,
        });
      }

      // Attach project role to request
      const userRole = await rbacService.getUserProjectRole(projectId, userId);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          error: 'Not a project member',
        });
      }
      req.user!.projectRole = userRole; // Assign project role to user

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Permission check failed',
      });
    }
  };
};

export const requireProjectPermission = (permission: keyof ProjectPermissions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const projectId = req.params.projectId || req.body.projectId;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
      }

      const canPerform = await rbacService.canPerformProjectAction(projectId, userId, permission);

      if (!canPerform) {
        return res.status(403).json({
          success: false,
          error: `Missing permission: ${permission}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Permission check failed',
      });
    }
  };
};
