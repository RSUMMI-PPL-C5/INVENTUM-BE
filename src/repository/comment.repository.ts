import { PrismaClient } from "@prisma/client";
import { CreateCommentDto } from "../dto/comment.dto";

export class CommentRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createComment(data: CreateCommentDto) {
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

  async getCommentsByRequestId(requestId: string) {
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

  async getAllComments() {
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
