import { Router, Request, Response } from "express";
import { loginController, verifyTokenController } from "../controllers/auth.controller";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.post("/", loginController);
router.get("/check", verifyToken, verifyTokenController);

export default router;