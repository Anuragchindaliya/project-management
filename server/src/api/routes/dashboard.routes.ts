import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { DashboardController } from '../../controllers/dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);

export default router;
