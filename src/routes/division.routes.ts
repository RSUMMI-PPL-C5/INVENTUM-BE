import { Router } from "express";
import DivisionController from "../controllers/division.controller";

const router = Router();
const divisionController = new DivisionController();

// Public routes for displaying divisions
router.get("/", divisionController.getDivisionsTree);
router.get("/all", divisionController.getAllDivisions);
router.get("/with-user-count", divisionController.getDivisionsWithUserCount);
router.get("/:id", divisionController.getDivisionById);

export default router;