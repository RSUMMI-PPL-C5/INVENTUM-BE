import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import verifyToken from "../middleware/verifyToken";

const router = Router();
const authController = new AuthController();

router.post("/", authController.login);
router.get("/check", verifyToken, authController.verifyToken);

export default router;