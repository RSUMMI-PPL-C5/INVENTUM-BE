import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import verifyToken from "../middleware/verifyToken";
import { loginLimiter } from "../middleware/rateLimiter";

const router = Router();
const controller = new AuthController();

// Routes
router
  .post("/", loginLimiter, controller.login)
  .get("/check", verifyToken, controller.verifyToken);

export default router;
