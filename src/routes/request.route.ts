import { Router } from "express";
import RequestController from "../controllers/request.controller";
import verifyToken from "../middleware/verifyToken";

const router = Router();
const requestController = new RequestController();

// Get all requests
router.get("/all", verifyToken, requestController.getAllRequests);

// Get all maintenance requests
router.get(
  "/maintenance",
  verifyToken,
  requestController.getAllRequestMaintenance,
);

// Get request by ID
router.get("/:id", verifyToken, requestController.getRequestById);

export default router;
