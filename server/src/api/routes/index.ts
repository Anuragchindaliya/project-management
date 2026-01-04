import { Router } from "express";
import authRoutes from "./auth.routes";
import workspaceRoutes from "./workspace.routes";

const router = Router();

// API version 1
router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
// router.use('/projects', projectRoutes);
// router.use('/tasks', taskRoutes);

export default router;
