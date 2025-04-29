import { Router } from "express";
import DivisionController from "../controllers/division.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const controller = new DivisionController();

// Global middleware
router.use(verifyToken, authorizeRoles("Admin"));

// Routes
router
  .post("/", controller.addDivision)
  .get("/", controller.getDivisionsTree)
  .get("/all", controller.getAllDivisions)
  .get("/with-user-count", controller.getDivisionsWithUserCount)
  .get("/:id", controller.getDivisionById)
  .put("/:id", controller.updateDivision)
  .delete("/:id", controller.deleteDivision);

export default router;
