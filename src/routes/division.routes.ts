import { Router } from "express";
import DivisionController from "../controllers/division.controller";
import verifyToken from "../middleware/verifyToken";

const router = Router();
const divisionController = new DivisionController();

// Public routes for displaying divisions
router.get("/", verifyToken, divisionController.getDivisionsTree);
router.get("/all", verifyToken, divisionController.getAllDivisions);
router.get(
  "/with-user-count",
  verifyToken,
  divisionController.getDivisionsWithUserCount,
);
router.get("/:id", verifyToken, divisionController.getDivisionById);
router.put("/:id", verifyToken, divisionController.updateDivision);
router.delete("/:id", verifyToken, divisionController.deleteDivision);

export default router;
