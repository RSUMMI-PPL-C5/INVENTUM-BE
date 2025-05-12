import { CreateCommentDto, CommentResponseDto } from "../dto/comment.dto";
import CommentRepository from "../repository/comment.repository";
import { ICommentService } from "../services/interface/comment.service.interface";

class CommentService implements ICommentService {
  private readonly commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  public async createComment(
    data: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    try {
      const comment = await this.commentRepository.createComment(data);
      return comment as CommentResponseDto;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw new Error("Failed to create comment");
    }
  }

  public async getCommentsByRequestId(
    requestId: string,
  ): Promise<CommentResponseDto[]> {
    try {
      const comments =
        await this.commentRepository.getCommentsByRequestId(requestId);
      return comments as CommentResponseDto[];
    } catch (error) {
      console.error("Error getting comments by request ID:", error);
      throw new Error("Failed to get comments");
    }
  }

  public async getAllComments(): Promise<CommentResponseDto[]> {
    try {
      const comments = await this.commentRepository.getAllComments();
      return comments as CommentResponseDto[];
    } catch (error) {
      console.error("Error getting all comments:", error);
      throw new Error("Failed to get comments");
    }
  }
}

export default CommentService;
