import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import { RequestResponseDTO, RequestDTO } from "../dto/request.dto";
import AppError from "../utils/appError";

export class RequestRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getRequestById(id: string): Promise<RequestResponseDTO | null> {
    try {
      const request = await this.prisma.request.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
          comments: {
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
          },
          notifications: true,
        },
      });

      return request;
    } catch (error) {
      console.error("Error fetching request by ID:", error);
      throw new AppError(`Failed to fetch request with ID ${id}`, 500);
    }
  }

  async getAllRequestMaintenance(): Promise<RequestDTO[]> {
    try {
      const requests = await this.prisma.request.findMany({
        where: {
          requestType: "MAINTENANCE",
        },
        orderBy: {
          submissionDate: "desc",
        },
      });

      return requests;
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      throw new AppError("Failed to fetch maintenance requests", 500);
    }
  }

  async getAllRequestCalibration(): Promise<RequestDTO[]> {
    try {
      const requests = await this.prisma.request.findMany({
        where: {
          requestType: "CALIBRATION",
        },
        orderBy: {
          submissionDate: "desc",
        },
      });

      return requests;
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      throw new AppError("Failed to fetch maintenance requests", 500);
    }
  }

  async getAllRequests(): Promise<RequestResponseDTO[]> {
    try {
      const requests = await this.prisma.request.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
          comments: {
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
          },
          notifications: true,
        },
        orderBy: {
          submissionDate: "desc",
        },
      });

      return requests;
    } catch (error) {
      console.error("Error fetching all requests:", error);
      throw new AppError("Failed to fetch all requests", 500);
    }
  }
}

export default RequestRepository;
