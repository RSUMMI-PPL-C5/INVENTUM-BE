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
import multer, { StorageEngine } from "multer";
import path from "path";
import { Request } from "express";

const router = Router();
const controller = new SparepartController();

const storage: StorageEngine = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) {
    cb(null, path.join(__dirname, "../../uploads/spareparts"));
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

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
  .post(
    "/",
    upload.single("image"),
    addSparepartValidation,
    validateRequest,
    controller.addSparepart,
  )
  .put(
    "/:id",
    upload.single("image"),
    updateSparepartValidation,
    validateRequest,
    controller.updateSparepart,
  )
  .delete("/:id", controller.deleteSparepart);

export default router;
