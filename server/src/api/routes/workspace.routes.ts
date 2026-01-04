import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import {
  requireWorkspaceAccess,
  requireWorkspacePermission,
} from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { WorkspaceController } from "controllers/workspace.controller";
import {
  addWorkspaceMemberSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from "validators/workspace.validator";

const router = Router();
const workspaceController = new WorkspaceController();

// All routes require authentication
router.use(authenticate);

// Create workspace
router.post(
  "/",
  validateRequest(createWorkspaceSchema),
  workspaceController.createWorkspace
);

// Get user's workspaces
router.get("/", workspaceController.getUserWorkspaces);

// Get workspace by ID
router.get("/:workspaceId", workspaceController.getWorkspaceById);

// Update workspace
router.patch(
  "/:workspaceId",
  requireWorkspaceAccess("admin" as any),
  validateRequest(updateWorkspaceSchema),
  workspaceController.updateWorkspace
);

// Member management
router.post(
  "/:workspaceId/members",
  requireWorkspacePermission("canManageMembers"),
  validateRequest(addWorkspaceMemberSchema),
  workspaceController.addMember
);

router.get("/:workspaceId/members", workspaceController.getMembers);

router.patch(
  "/:workspaceId/members/:userId",
  requireWorkspacePermission("canManageMembers"),
  workspaceController.updateMemberRole
);

router.delete(
  "/:workspaceId/members/:userId",
  requireWorkspacePermission("canManageMembers"),
  workspaceController.removeMember
);

export default router;
