import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  requireWorkspacePermission,
  requireProjectPermission,
} from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  updateProjectMemberRoleSchema,
  removeProjectMemberSchema,
  getProjectSchema,
  getWorkspaceProjectsSchema,
} from '../../validators/project.validator';
import { ProjectController } from '../../controllers/project.controller';

const router = Router();
const projectController = new ProjectController();

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post(
  '/',
  requireWorkspacePermission('canCreateProjects'),
  validateRequest(createProjectSchema),
  projectController.createProject
);

router.get(
  '/workspace/:workspaceId',
  validateRequest(getWorkspaceProjectsSchema),
  projectController.getWorkspaceProjects
);

router.get('/:projectId', validateRequest(getProjectSchema), projectController.getProjectById);

router.patch(
  '/:projectId',
  requireProjectPermission('canEditProject'),
  validateRequest(updateProjectSchema),
  projectController.updateProject
);

router.delete(
  '/:projectId',
  requireProjectPermission('canEditProject'),
  validateRequest(getProjectSchema),
  projectController.deleteProject
);

// Project Members Management
router.get('/:projectId/members', validateRequest(getProjectSchema), projectController.getMembers);

router.post(
  '/:projectId/members',
  requireProjectPermission('canEditProject'),
  validateRequest(addProjectMemberSchema),
  projectController.addMember
);

router.patch(
  '/:projectId/members/:userId',
  requireProjectPermission('canEditProject'),
  validateRequest(updateProjectMemberRoleSchema),
  projectController.updateMemberRole
);

router.delete(
  '/:projectId/members/:userId',
  requireProjectPermission('canEditProject'),
  validateRequest(removeProjectMemberSchema),
  projectController.removeMember
);

export default router;
