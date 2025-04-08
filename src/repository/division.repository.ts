import { PrismaClient, Prisma } from "@prisma/client";
import { DivisionDTO, DivisionWithChildrenDTO } from "../dto/division.dto";
import AppError from "../utils/appError";
import prisma from "../configs/db.config";

class DivisionRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO> {
    return await this.prisma.listDivisi.create({ data });
  }

  public async getDivisionById(id: number): Promise<DivisionDTO | null> {
    return await this.prisma.listDivisi.findUnique({ where: { id } });
  }

  /**
   * Get all divisions without hierarchy
   */
  public async getAllDivisions(): Promise<DivisionDTO[]> {
    return await this.prisma.listDivisi.findMany();
  }

  /**
   * Get hierarchical division structure (root divisions with their children)
   * This formats the data for tree display in the frontend
   */
  public async getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]> {
    const rootDivisions = await this.prisma.listDivisi.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true, // Up to 3 levels deep
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
      await this.prisma.user.updateMany({
        where: { divisiId: id },
        data: { divisiId: null },
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
}

export default DivisionRepository;
