import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  requireWorkspaceAccess,
  requireWorkspacePermission,
} from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
  removeWorkspaceMemberSchema,
  getWorkspaceSchema,
} from '../../validators/workspace.validator';
import { WorkspaceController } from '../../controllers/workspace.controller';

const router = Router();
const workspaceController = new WorkspaceController();

// All routes require authentication
router.use(authenticate);

// Workspace CRUD
router.post('/', validateRequest(createWorkspaceSchema), workspaceController.createWorkspace);

router.get('/', workspaceController.getUserWorkspaces);

router.get(
  '/:workspaceId',
  validateRequest(getWorkspaceSchema),
  workspaceController.getWorkspaceById
);

router.patch(
  '/:workspaceId',
  requireWorkspaceAccess('admin' as any),
  validateRequest(updateWorkspaceSchema),
  workspaceController.updateWorkspace
);

router.delete(
  '/:workspaceId',
  requireWorkspaceAccess('owner' as any),
  validateRequest(getWorkspaceSchema),
  workspaceController.deleteWorkspace
);

// Workspace Members Management
router.get(
  '/:workspaceId/members',
  validateRequest(getWorkspaceSchema),
  workspaceController.getMembers
);

router.post(
  '/:workspaceId/members',
  requireWorkspacePermission('canManageMembers'),
  validateRequest(addWorkspaceMemberSchema),
  workspaceController.addMember
);

router.post(
  '/:workspaceId/members/invite',
  requireWorkspacePermission('canManageMembers'),
  // Validate invite schema (need to import or create)
  // For now using manual validation or same schema if compatible
  workspaceController.inviteMember
);

router.patch(
  '/:workspaceId/members/:userId',
  requireWorkspacePermission('canManageMembers'),
  validateRequest(updateWorkspaceMemberRoleSchema),
  workspaceController.updateMemberRole
);

router.delete(
  '/:workspaceId/members/:userId',
  requireWorkspacePermission('canManageMembers'),
  validateRequest(removeWorkspaceMemberSchema),
  workspaceController.removeMember
);

export default router;
