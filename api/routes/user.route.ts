import { Router } from "express";
import { getUsersController, getUserByIdController, updateUserController } from "../controllers/user.controller";

const router = Router();

router.get("/users", getUsersController);
router.get("/users/:id", getUserByIdController);
router.put("/users/:id", updateUserController);

export default router;