import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../../validators/auth.validator';
import { AuthController } from '../../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.me);
router.patch(
  '/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);
router.patch(
  '/password',
  authenticate,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

export default router;
