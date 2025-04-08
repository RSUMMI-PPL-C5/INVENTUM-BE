// src/routes/sparepart.route.ts
import { Router } from "express";
import SparepartController from "../controllers/sparepart.controller";
import verifyToken from "../middleware/verifyToken";
import { sparepartFilterQueryValidation } from "../validations/sparepartfilterquery.validation";
import { addSparepartValidation } from "../validations/addsparepart.validation";

const router = Router();
const sparepartController = new SparepartController();

// GET routes
router.get(
  "/",
  verifyToken,
  sparepartFilterQueryValidation,
  sparepartController.getSpareparts,
);
router.get("/:id", verifyToken, sparepartController.getSparepartById);

// POST route
router.post(
  "/",
  verifyToken,
  addSparepartValidation,
  sparepartController.addSparepart,
);

// PUT route
router.put("/:id", verifyToken, sparepartController.updateSparepart);

// DELETE route (soft delete)
router.delete("/:id", verifyToken, sparepartController.deleteSparepart);

export default router;
