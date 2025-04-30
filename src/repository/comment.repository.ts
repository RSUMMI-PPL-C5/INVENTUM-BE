import { PrismaClient } from "@prisma/client";
import { CreateCommentDto } from "../dto/comment.dto";
import prisma from "../configs/db.config";

class CommentRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async createComment(data: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        text: data.text,
        user: {
          connect: { id: data.userId },
        },
        ...(data.requestId
          ? {
              request: {
                connect: { id: data.requestId },
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
        request: true,
      },
    });
  }

  public async getCommentsByRequestId(requestId: string) {
    return this.prisma.comment.findMany({
      where: {
        requestId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async getAllComments() {
    return this.prisma.comment.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
        request: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export default CommentRepository;
