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
import { TaskController } from '../../controllers/task.controller';
import {
  createTaskSchema,
  getProjectTasksSchema,
} from '../../validators/task.validator';

const router = Router();
const projectController = new ProjectController();
const taskController = new TaskController();

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

router.get('/health', projectController.getProjectsHealth);

router.get('/:projectId', validateRequest(getProjectSchema), projectController.getProjectById);

router.post(
  '/:projectId/tasks',
  requireProjectPermission('canCreateTasks'),
  validateRequest(createTaskSchema),
  taskController.createTask
);

router.get(
  '/:projectId/tasks',
  validateRequest(getProjectTasksSchema),
  taskController.getProjectTasks
);

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
