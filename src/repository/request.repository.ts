import { PrismaClient } from "@prisma/client";
import prisma from "../configs/db.config";
import { RequestResponseDTO, RequestDTO } from "../dto/request.dto";
import { getJakartaTime } from "../utils/date.utils";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { RequestFilterOptions } from "../interfaces/request.filter.interface";

export class RequestRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
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

  private buildWhereClause(
    search?: string,
    filters?: RequestFilterOptions,
  ): any {
    const where: any = {};

    if (search) {
      where.OR = [
        { medicalEquipment: { contains: search } },
        { complaint: { contains: search } },
      ];
    }

    if (filters) {
      if (filters.status) {
        const statusArray = Array.isArray(filters.status)
          ? filters.status
          : [filters.status];
        where.status = { in: statusArray };
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      this.addDateFilters(where, filters);
    }

    return where;
  }

  private addDateFilters(where: any, filters: RequestFilterOptions): void {
    if (filters.createdOnStart || filters.createdOnEnd) {
      where.createdOn = {};
      if (filters.createdOnStart) {
        where.createdOn.gte = new Date(filters.createdOnStart);
      }
      if (filters.createdOnEnd) {
        where.createdOn.lte = new Date(filters.createdOnEnd);
      }
    }
  }

  public async getAllRequests(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ): Promise<{ requests: RequestResponseDTO[]; total: number }> {
    const where = this.buildWhereClause(search, filters);

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
    const where: any = { requestType: "MAINTENANCE" };

    if (search) {
      where.OR = [
        { medicalEquipment: { contains: search } },
        { complaint: { contains: search } },
      ];
    }

    if (filters) {
      if (filters.status) {
        const statusArray = Array.isArray(filters.status)
          ? filters.status
          : [filters.status];
        where.status = { in: statusArray };
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      this.addDateFilters(where, filters);
    }

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
    const where: any = { requestType: "CALIBRATION" };

    if (search) {
      where.OR = [
        { medicalEquipment: { contains: search } },
        { complaint: { contains: search } },
      ];
    }

    if (filters) {
      if (filters.status) {
        const statusArray = Array.isArray(filters.status)
          ? filters.status
          : [filters.status];
        where.status = { in: statusArray };
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      // Add date filters
      this.addDateFilters(where, filters);
    }

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
        status: "Pending", // Default status
        createdOn: jakartaTime,
        modifiedOn: jakartaTime,
      },
    });
  }
}

export default RequestRepository;
