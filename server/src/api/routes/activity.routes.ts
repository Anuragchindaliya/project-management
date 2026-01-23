
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { ActivityController } from '../../controllers/activity.controller';

const router = Router();
const activityController = new ActivityController();

router.use(authenticate);

router.get('/tasks/:taskId/activity', activityController.getTaskActivity);

export default router;
