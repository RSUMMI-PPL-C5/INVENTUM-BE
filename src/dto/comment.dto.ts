export class CreateCommentDto {
  text!: string;
  userId!: string;
  requestId?: string;
}

export class CommentResponseDto {
  id!: string;
  text!: string;
  userId!: string;
  requestId?: string;
  createdAt!: Date;
  modifiedAt!: Date;
  user?: {
    id: string;
    fullname: string;
    username: string;
  };
}
