import { Router } from "express";
import SparepartController from "../controllers/sparepart.controller";
import verifyToken from "../middleware/verifyToken";
import {
  addSparepartValidation,
  updateSparepartValidation,
  sparepartFilterQueryValidation,
} from "../validations/spareparts.validation";
import { validateRequest } from "../middleware/validateRequest";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const controller = new SparepartController();

// Global middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

// Routes
router
  .get(
    "/",
    sparepartFilterQueryValidation,
    validateRequest,
    controller.getSpareparts,
  )
  .get("/:id", controller.getSparepartById)
  .post("/", addSparepartValidation, validateRequest, controller.addSparepart)
  .put(
    "/:id",
    updateSparepartValidation,
    validateRequest,
    controller.updateSparepart,
  )
  .delete("/:id", controller.deleteSparepart);

export default router;
