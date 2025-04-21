import { Router } from "express";
import DivisionController from "../controllers/division.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const divisionController = new DivisionController();

router.use(verifyToken, authorizeRoles("Admin"));

// Public routes for displaying divisions
router.post("/", divisionController.addDivision);
router.get("/", divisionController.getDivisionsTree);
router.get("/all", divisionController.getAllDivisions);
router.get("/with-user-count", divisionController.getDivisionsWithUserCount);
router.get("/:id", divisionController.getDivisionById);
router.put("/:id", divisionController.updateDivision);
router.delete("/:id", divisionController.deleteDivision);

export default router;
