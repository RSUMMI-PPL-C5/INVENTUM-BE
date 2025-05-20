import { PrismaClient } from "@prisma/client";
import { UserDTO, AddUserResponseDTO } from "../dto/user.dto";
import { getJakartaTime } from "../utils/date.utils";
import prisma from "../configs/db.config";
import { UserFilterOptions } from "../interfaces/user.filter.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import UserWhereBuilder from "../utils/builders/user-where.builder";

class UserRepository {
  private readonly prisma: PrismaClient;
  private readonly whereBuilder: UserWhereBuilder;

  constructor() {
    this.prisma = prisma;
    this.whereBuilder = new UserWhereBuilder();
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

  public async getUsers(
    search?: string,
    filters?: UserFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const where = this.whereBuilder.buildComplete(search, filters);

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
          modifiedOn: "desc",
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
      include: {
        divisi: true,
      },
    });
  }

  public async getUserByUsername(username: string): Promise<UserDTO | null> {
    return await this.prisma.user.findFirst({
      where: {
        username,
        deletedOn: null,
      },
      include: {
        divisi: true,
      },
    });
  }

  public async getUserByNokar(nokar: string): Promise<UserDTO | null> {
    return await this.prisma.user.findFirst({
      where: {
        nokar,
        deletedOn: null,
      },
      include: {
        divisi: true,
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
  public async getUsersByRole(
    role: string,
  ): Promise<Array<{ id: string; waNumber: string | null }>> {
    return await this.prisma.user.findMany({
      where: {
        role: role,
      },
      select: {
        id: true,
        waNumber: true,
      },
    });
  }
}

export default UserRepository;
