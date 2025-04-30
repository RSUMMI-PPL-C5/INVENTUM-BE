import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import verifyToken from "../middleware/verifyToken";

const router = Router();
const commentController = new CommentController();

// Create a new comment
router.post("/", verifyToken, commentController.createComment);

// Get all comments
router.get("/", verifyToken, commentController.getAllComments);

// Get comments by requestId
router.get(
  "/request/:requestId",
  verifyToken,
  commentController.getCommentsByRequestId,
);

export default router;
