import { Router } from "express";
import UserController from "../controllers/user.controller";
import verifyToken from "../middleware/verifyToken";
import {
  addUserValidation,
  updateUserValidation,
  userFilterQueryValidation,
} from "../validations/user.validation";
import authorizeRoles from "../middleware/authorizeRole";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();
const controller = new UserController();

// Global middleware
router.use(verifyToken, authorizeRoles("Admin"));

// Routes
router
  .get("/", userFilterQueryValidation, validateRequest, controller.getUsers)
  .get("/:id", controller.getUserById)
  .post("/", addUserValidation, validateRequest, controller.createUser)
  .put("/:id", updateUserValidation, validateRequest, controller.updateUser)
  .delete("/:id", controller.deleteUser);

export default router;
