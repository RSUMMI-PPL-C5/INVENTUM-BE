import { PrismaClient, Prisma } from "@prisma/client";
import { DivisionDTO, DivisionWithChildrenDTO } from "../dto/division.dto";

import prisma from "../configs/db.config";

class DivisionRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get all divisions without hierarchy
   */
  public async getAllDivisions(): Promise<DivisionDTO[]> {
    return await this.prisma.listDivisi.findMany();
  }

  /**
   * Get a division by its ID
   */
  public async getDivisionById(id: number): Promise<DivisionDTO | null> {
    return await this.prisma.listDivisi.findUnique({
      where: { id },
    });
  }

  /**
   * Get hierarchical division structure (root divisions with their children)
   * This formats the data for tree display in the frontend
   */
  public async getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]> {
    // Get only root divisions (those without parents)
    const rootDivisions = await this.prisma.listDivisi.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true, // Include up to 3 levels deep
              },
            },
          },
        },
      },
    });

    return rootDivisions;
  }

  /**
   * Get a specific division with its children
   */
  public async getDivisionWithChildren(
    id: number,
  ): Promise<DivisionWithChildrenDTO | null> {
    return await this.prisma.listDivisi.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });
  }

  /**
   * Get divisions based on filter criteria
   */
  public async getFilteredDivisions(
    whereClause: Prisma.ListDivisiWhereInput,
  ): Promise<DivisionDTO[]> {
    return await this.prisma.listDivisi.findMany({ where: whereClause });
  }

  /**
   * Get divisions with user count
   */
  public async getDivisionsWithUserCount(): Promise<
    Array<DivisionDTO & { userCount: number }>
  > {
    // Add type assertion to tell TypeScript about the _count property
    const divisions = (await this.prisma.listDivisi.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    })) as Array<DivisionDTO & { _count: { users: number } }>;

    return divisions.map((division) => ({
      ...division,
      userCount: division._count.users,
    }));
  }

  public async deleteDivision(id: number): Promise<boolean> {
    try {
      await this.prisma.listDivisi.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete division with ID ${id}:`, error);
      return false;
    }
  }
}

export default DivisionRepository;
