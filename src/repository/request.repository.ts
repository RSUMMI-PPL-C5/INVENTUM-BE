import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import { RequestResponseDTO, RequestDTO } from "../dto/request.dto";
import { getJakartaTime } from "../utils/date.utils";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { RequestFilterOptions } from "../interfaces/request.filter.interface";
import RequestWhereBuilder from "../utils/builders/request-where.builder";

class RequestRepository {
  private readonly prisma: PrismaClient;
  private readonly whereBuilder: RequestWhereBuilder;

  constructor() {
    this.prisma = prisma;
    this.whereBuilder = new RequestWhereBuilder();
  }

  public async getRequestById(id: string): Promise<RequestResponseDTO | null> {
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
  }

  public async getAllRequests(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ requests: RequestResponseDTO[]; total: number }> {
    const where = this.whereBuilder.buildComplete(search, filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
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
          createdOn: "desc",
        },
        skip,
        take,
      }),
      this.prisma.request.count({ where }),
    ]);

    return { requests, total };
  }

  public async getAllRequestMaintenance(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ requests: RequestDTO[]; total: number }> {
    const where = this.whereBuilder.buildComplete(
      search,
      filters,
      "MAINTENANCE",
    );

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
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
          createdOn: "desc",
        },
        skip,
        take,
      }),
      this.prisma.request.count({ where }),
    ]);

    return { requests, total };
  }

  public async getAllRequestCalibration(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ requests: RequestDTO[]; total: number }> {
    const where = this.whereBuilder.buildComplete(
      search,
      filters,
      "CALIBRATION",
    );

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
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
          createdOn: "desc",
        },
        skip,
        take,
      }),
      this.prisma.request.count({ where }),
    ]);

    return { requests, total };
  }

  public async createRequest(requestData: any): Promise<any> {
    const jakartaTime = getJakartaTime();
    return await this.prisma.request.create({
      data: {
        ...requestData,
        status: "pending", // Default status
        createdOn: jakartaTime,
        modifiedOn: jakartaTime,
      },
    });
  }

  public async updateRequestStatus(id: string, status: string): Promise<any> {
    const jakartaTime = getJakartaTime();
    return await this.prisma.request.update({
      where: { id },
      data: {
        status,
        modifiedOn: jakartaTime,
      },
    });
  }
}

export default RequestRepository;
