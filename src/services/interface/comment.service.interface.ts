import { CreateCommentDto, CommentResponseDto } from "../../dto/comment.dto";

export interface ICommentService {
  createComment(data: CreateCommentDto): Promise<CommentResponseDto>;
  getCommentsByRequestId(requestId: string): Promise<CommentResponseDto[]>;
  getAllComments(): Promise<CommentResponseDto[]>;
}
