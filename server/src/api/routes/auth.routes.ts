import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../../validators/auth.validator";
import { AuthController } from "../../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
