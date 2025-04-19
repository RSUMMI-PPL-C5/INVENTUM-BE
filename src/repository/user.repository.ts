import { PrismaClient } from "@prisma/client";
import { UserDTO, AddUserResponseDTO } from "../dto/user.dto";

import prisma from "../configs/db.config";
import { UserFilterOptions, PaginationOptions } from "../filters/interface/user.filter.interface";

class UserRepository {
	private readonly prisma: PrismaClient;

	constructor() {
		this.prisma = prisma;
	}

    public async createUser(userData: any): Promise<AddUserResponseDTO> {
		const newUser = await this.prisma.user.create({
			data: userData,
			select: {
				id: true,
				email: true,
				username: true,
			},
		});

		return newUser;
	}

  private buildWhereClause(
    search?: string,
    filters?: UserFilterOptions
  ): any {
    const where: any = {};
  
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
  
      this.addCreatedAtFilter(where, filters);
      this.addUpdatedAtFilter(where, filters);
    }
  
    return where;
  }
  
  private addCreatedAtFilter(where: any, filters: UserFilterOptions): void {
    if (filters.createdOnStart || filters.createdOnEnd) {
      where.createdAt = {};
      if (filters.createdOnStart) {
        where.createdAt.gte = new Date(filters.createdOnStart);
      }
      if (filters.createdOnEnd) {
        where.createdAt.lte = new Date(filters.createdOnEnd);
      }
    }
  }
  
  private addUpdatedAtFilter(where: any, filters: UserFilterOptions): void {
    if (filters.modifiedOnStart || filters.modifiedOnEnd) {
      where.updatedAt = {};
      if (filters.modifiedOnStart) {
        where.updatedAt.gte = new Date(filters.modifiedOnStart);
      }
      if (filters.modifiedOnEnd) {
        where.updatedAt.lte = new Date(filters.modifiedOnEnd);
      }
    }
  }
  
  public async getUsers(
    search?: string,
    filters?: UserFilterOptions,
    pagination?: PaginationOptions
  ) {
    const where = this.buildWhereClause(search, filters);
  
    const skip = pagination ? (pagination.page - 1) * pagination.limit : undefined;
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
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                divisi: true
            }
        });
    
        if (!user) {
            return null;
        }
    
        return {
            ...user,
            divisionName: user.divisi?.divisi ?? null
        };
    }

	public async getUserByEmail(email: string): Promise<UserDTO | null> {
		return await this.prisma.user.findUnique({
			where: { email },
		});
	}

	public async getUserByUsername(username: string): Promise<UserDTO | null> {
		return await this.prisma.user.findUnique({
			where: { username },
		});
	}

	public async updateUser(
		id: string,
		data: Partial<UserDTO>
	): Promise<UserDTO | null> {
		return await this.prisma.user.update({
			where: { id },
			data,
		});
	}

	public async deleteUser(id: string): Promise<UserDTO | null> {
		return await this.prisma.user.delete({
			where: { id },
		});
	}
}

export default UserRepository;
