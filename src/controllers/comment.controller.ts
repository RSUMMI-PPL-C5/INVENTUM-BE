import { Request, Response, NextFunction } from "express";
import CommentService from "../services/comment.service";
import { CreateCommentDto } from "../dto/comment.dto";

class CommentController {
  private readonly commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  public createComment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req.user as any).userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const createCommentDto: CreateCommentDto = {
        text: req.body.text,
        userId: userId,
        requestId: req.body.requestId, // Optional
      };

      const comment = await this.commentService.createComment(createCommentDto);

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  public getCommentsByRequestId = async (
    req: Request,
    res: Response,
    next: NextFunction,
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
      next(error);
    }
  };

  public getAllComments = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const comments = await this.commentService.getAllComments();

      res.status(200).json({
        success: true,
        message: "All comments retrieved successfully",
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
