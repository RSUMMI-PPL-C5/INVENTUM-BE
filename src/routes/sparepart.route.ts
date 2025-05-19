import { Router } from "express";
import SparepartController from "../controllers/sparepart.controller";
import { upload } from "../middleware/upload.middleware";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";
import { validateRequest } from "../middleware/validateRequest";
import {
  addSparepartValidation,
  updateSparepartValidation,
  sparepartFilterQueryValidation,
} from "../validations/spareparts.validation";

const router = Router();
const sparepartController = new SparepartController();

// Middleware untuk autentikasi dan otorisasi
router.use(verifyToken, authorizeRoles("admin", "user"));

// Routes
router.get(
  "/",
  sparepartFilterQueryValidation,
  validateRequest,
  sparepartController.getSpareparts,
);
router.get("/:id", sparepartController.getSparepartById);
router.post(
  "/",
  upload.single("image"),
  addSparepartValidation,
  validateRequest,
  sparepartController.addSparepart,
);
router.put(
  "/:id",
  upload.single("image"),
  updateSparepartValidation,
  validateRequest,
  sparepartController.updateSparepart,
);
router.delete("/:id", sparepartController.deleteSparepart);

export default router;
