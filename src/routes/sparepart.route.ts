import { Router } from "express";
import SparepartController from "../controllers/sparepart.controller";
import verifyToken from "../middleware/verifyToken";
import { sparepartFilterQueryValidation } from "../validations/sparepartfilterquery.validation";
import {
  addSparepartValidation,
  updateSparepartValidation,
} from "../validations/spareparts.validation";
import { validateRequest } from "../middleware/validateRequest";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const sparepartController = new SparepartController();

router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

router.get(
  "/",
  sparepartFilterQueryValidation,
  sparepartController.getSpareparts,
);
router.get("/:id", sparepartController.getSparepartById);
router.post(
  "/",
  addSparepartValidation,
  validateRequest,
  sparepartController.addSparepart,
);
router.put(
  "/:id",
  updateSparepartValidation,
  validateRequest,
  sparepartController.updateSparepart,
);
router.delete("/:id", sparepartController.deleteSparepart);

export default router;
