import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CommentService } from "../services/comment.service";
import { CreateCommentDto } from "../dto/comment.dto";

// Add this interface to properly type the request with user data
interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
    [key: string]: any;
  };
}

export class CommentController {
  private readonly commentService: CommentService;

  constructor() {
    const prisma = new PrismaClient();
    this.commentService = new CommentService(prisma);
  }

  createComment = async (req: Request, res: Response): Promise<void> => {
    try {
      // Cast to AuthRequest type to access user property
      const authReq = req as AuthRequest;

      // Extract user ID from the token - change to userId to match your token
      const userId = authReq.user.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      // Create DTO with text from request body and userId from token
      const createCommentDto: CreateCommentDto = {
        text: req.body.text,
        userId: userId,
        requestId: req.body.requestId, // Optional
      };

      // Rest of the method stays the same
      const comment = await this.commentService.createComment(createCommentDto);

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: comment,
      });
    } catch (error) {
      console.error("Error in create comment controller:", error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create comment",
      });
    }
  };

  getCommentsByRequestId = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { requestId } = req.params;

      if (!requestId) {
        res.status(400).json({
          success: false,
          message: "Request ID is required",
        });
        return;
      }

      const comments =
        await this.commentService.getCommentsByRequestId(requestId);

      res.status(200).json({
        success: true,
        message: "Comments retrieved successfully",
        data: comments,
      });
    } catch (error) {
      console.error("Error in get comments controller:", error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get comments",
      });
    }
  };

  getAllComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const comments = await this.commentService.getAllComments();

      res.status(200).json({
        success: true,
        message: "All comments retrieved successfully",
        data: comments,
      });
    } catch (error) {
      console.error("Error in get all comments controller:", error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get comments",
      });
    }
  };
}
