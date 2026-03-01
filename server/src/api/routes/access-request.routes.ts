import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { AccessRequestController } from '../../controllers/access-request.controller';

const router = Router();
const accessRequestController = new AccessRequestController();

router.use(authenticate);

router.post('/', accessRequestController.createRequest);
router.get('/pending', accessRequestController.getPendingRequests);
router.patch('/:requestId/respond', accessRequestController.processRequest);

export default router;
