import { Router } from "express";
import SparepartController from "../controllers/sparepart.controller";
import verifyToken from "../middleware/verifyToken";
import { addSparepartValidation } from "../validations/addsparepart.validation";

const router = Router();
const sparepartController = new SparepartController();

router.post(
  "/",
  verifyToken,
  addSparepartValidation,
  sparepartController.addSparepart,
);
router.put("/:id", verifyToken, sparepartController.updateSparepart);
router.delete("/:id", verifyToken, sparepartController.deleteSparepart);

export default router;
