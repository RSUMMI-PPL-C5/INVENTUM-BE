// src/routes/sparepart.route.ts
import { Router } from "express";
import SparepartController from "../controllers/sparepart.controller";
import verifyToken from "../middleware/verifyToken";
import { sparepartFilterQueryValidation } from "../validations/sparepartfilterquery.validation";

const router = Router();
const sparepartController = new SparepartController();

router.get(
  "/",
  verifyToken,
  sparepartFilterQueryValidation,
  sparepartController.getSpareparts,
);
router.get("/:id", verifyToken, sparepartController.getSparepartById);

export default router;
