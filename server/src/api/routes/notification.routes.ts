
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { NotificationController } from '../../controllers/notification.controller';

const router = Router();
const notificationController = new NotificationController();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
