import { PrismaClient, Prisma } from "@prisma/client";
import { DivisionDTO, DivisionWithChildrenDTO } from "../dto/division.dto";
import AppError from "../utils/appError";

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

  public async updateDivision(
    id: number,
    data: Prisma.ListDivisiUpdateInput,
  ): Promise<DivisionDTO> {
    try {
      return await this.prisma.listDivisi.update({
        where: { id },
        data,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Handle specific Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: Record not found
        if (error.code === "P2025") {
          throw new AppError(`Division with ID ${id} not found`, 404);
        }
        // P2002: Unique constraint violation
        if (error.code === "P2002") {
          throw new AppError(`Division with this name already exists`, 400);
        }
        // P2003: Foreign key constraint violation
        if (error.code === "P2003") {
          throw new AppError(`Invalid parent division ID`, 400);
        }
      }

      throw new AppError(
        `Failed to update division with ID ${id}: ${errorMessage}`,
        500,
      );
    }
  }

  public async hasCircularReference(
    divisionId: number,
    potentialAncestorId: number,
  ): Promise<boolean> {
    // Base case: if they're the same, it's not a descendant
    if (divisionId === potentialAncestorId) {
      return false;
    }

    const division = await this.prisma.listDivisi.findUnique({
      where: { id: divisionId },
      select: { parentId: true },
    });

    // If no parent, it's not a descendant
    if (division === null) {
      return false;
    }

    if (division.parentId === null) {
      return false;
    }

    // If parent is the potential ancestor, it is a descendant
    if (division.parentId === potentialAncestorId) {
      return true;
    }

    // Recursively check if the parent is a descendant
    return this.hasCircularReference(division.parentId, potentialAncestorId);
  }

  public async deleteDivision(id: number): Promise<boolean> {
    try {
      await this.prisma.user.updateMany({
        where: {
          divisiId: id,
        },
        data: {
          divisiId: null,
        },
      });

      await this.prisma.listDivisi.deleteMany({
        where: {
          OR: [{ id }, { parentId: id }],
        },
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AppError(
        `Failed to delete division with ID ${id}: ${errorMessage}`,
        500,
      );
    }
  }

  public async addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO> {
    return await this.prisma.listDivisi.create({ data });
  }
}

export default DivisionRepository;
