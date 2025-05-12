import { Router } from "express";
import CommentController from "../controllers/comment.controller";
import verifyToken from "../middleware/verifyToken";
import authorizeRoles from "../middleware/authorizeRole";

const router = Router();
const commentController = new CommentController();

// Middleware
router.use(verifyToken, authorizeRoles("Admin", "Fasum", "User"));

// Create a new comment
router.post("/", commentController.createComment);

// Get all comments
router.get("/", commentController.getAllComments);

// Get comments by requestId
router.get("/request/:requestId", commentController.getCommentsByRequestId);

export default router;
