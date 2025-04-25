import { PrismaClient } from "@prisma/client";
import { UserDTO, AddUserResponseDTO } from "../dto/user.dto";
import { getJakartaTime } from "../utils/date.utils";
import prisma from "../configs/db.config";
import { UserFilterOptions } from "../filters/interface/user.filter.interface";
import { PaginationOptions } from "../filters/interface/pagination.interface";

class UserRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async createUser(userData: any): Promise<AddUserResponseDTO> {
    const jakartaTime = getJakartaTime();
    const newUser = await this.prisma.user.create({
      data: {
        ...userData,
        createdOn: jakartaTime,
        modifiedOn: jakartaTime,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdOn: true,
        createdBy: true,
      },
    });

    return newUser;
  }

  private buildWhereClause(search?: string, filters?: UserFilterOptions): any {
    const where: any = {
      deletedOn: null, // Filter to exclude soft deleted records
    };

    if (search) {
      where.OR = [
        { fullname: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ];
    }

    if (filters) {
      if (filters.role) {
        where.role = { in: filters.role };
      }

      if (filters.divisiId) {
        where.divisiId = { in: filters.divisiId };
      }

      this.addCreatedOnFilter(where, filters);
      this.addModifiedOnFilter(where, filters);
    }

    return where;
  }

  private addCreatedOnFilter(where: any, filters: UserFilterOptions): void {
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

  private addModifiedOnFilter(where: any, filters: UserFilterOptions): void {
    if (filters.modifiedOnStart || filters.modifiedOnEnd) {
      where.modifiedOn = {};
      if (filters.modifiedOnStart) {
        where.modifiedOn.gte = new Date(filters.modifiedOnStart);
      }
      if (filters.modifiedOnEnd) {
        where.modifiedOn.lte = new Date(filters.modifiedOnEnd);
      }
    }
  }

  public async getUsers(
    search?: string,
    filters?: UserFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const where = this.buildWhereClause(search, filters);

    const skip = pagination
      ? (pagination.page - 1) * pagination.limit
      : undefined;
    const take = pagination ? pagination.limit : undefined;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          divisi: true,
        },
        orderBy: {
          id: "desc",
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  public async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedOn: null,
      },
      include: {
        divisi: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      divisionName: user.divisi?.divisi ?? null,
    };
  }

  public async getUserByEmail(email: string): Promise<UserDTO | null> {
    return await this.prisma.user.findFirst({
      where: {
        email,
        deletedOn: null,
      },
    });
  }

  public async getUserByUsername(username: string): Promise<UserDTO | null> {
    return await this.prisma.user.findFirst({
      where: {
        username,
        deletedOn: null,
      },
    });
  }

  public async getUserByNokar(nokar: string): Promise<UserDTO | null> {
    return await this.prisma.user.findFirst({
      where: {
        nokar,
        deletedOn: null,
      },
    });
  }

  public async updateUser(
    id: string,
    data: Partial<UserDTO>,
  ): Promise<UserDTO | null> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        modifiedOn: getJakartaTime(),
      },
    });
  }

  public async deleteUser(
    id: string,
    deletedBy?: string,
  ): Promise<UserDTO | null> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        deletedOn: getJakartaTime(),
        deletedBy: deletedBy,
      },
    });
  }
}

export default UserRepository;
