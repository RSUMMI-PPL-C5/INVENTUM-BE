import { Router, Request } from "express";
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
import crypto from "crypto";

const router = Router();
const controller = new SparepartController();

// Konfigurasi batasan file
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

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
    // Generate random bytes and convert to hex string
    const randomBytes = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    const uniqueSuffix = `${timestamp}-${randomBytes}`;
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Konfigurasi multer dengan batasan
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
      return;
    }
    cb(null, true);
  },
});

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
