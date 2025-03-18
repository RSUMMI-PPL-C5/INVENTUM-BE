import { Router } from "express";
import UserController from "../controllers/user.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRoles";

const router = Router();
const userController = new UserController();

router.get("/", verifyToken, authorizeRoles("admin"), userController.getUsers);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  userController.getUserById,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  userController.updateUser,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  userController.deleteUser,
);

export default router;
