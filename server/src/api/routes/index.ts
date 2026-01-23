import { Request, Response, Router } from 'express';
import authRoutes from './auth.routes';
import workspaceRoutes from './workspace.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import commentRoutes from './comment.routes';
import dashboardRoutes from './dashboard.routes';
// import attachmentRoutes from './attachment.routes';
// import activityRoutes from './activity.routes';

const router = Router();

// Health check (no authentication required)
router.get('/health', (_, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API version 1 routes
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/dashboard', dashboardRoutes);
// router.use('/attachments', attachmentRoutes);
// router.use('/activity', activityRoutes);

// 404 handler for API routes
router.use((req: Request, res: Response) => {
  const errorMessage = 'Route not found';
  res.status(404).json({
    success: false,
    error: errorMessage,
    path: req.originalUrl,
  });
});

export default router;
