import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import verifyToken from "../middleware/verifyToken";
import { loginLimiter } from "../middleware/rateLimiter";

const router = Router();
const authController = new AuthController();

router.post("/", loginLimiter, authController.login);
router.get("/check", verifyToken, authController.verifyToken);

export default router;
