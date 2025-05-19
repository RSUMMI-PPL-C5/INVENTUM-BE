import { PrismaClient, Prisma } from "@prisma/client";
import { DivisionDTO, DivisionWithChildrenDTO } from "../dto/division.dto";
import prisma from "../configs/db.config";

class DivisionRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  private validateDivisionName(name?: string | null): void {
    if (!name || name.trim() === "") {
      throw new Error(
        "Division name cannot be empty or contain only whitespace",
      );
    }
  }

  public async addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO> {
    if (data.divisi !== undefined) {
      this.validateDivisionName(data.divisi);
    }

    return await this.prisma.listDivisi.create({ data });
  }

  public async getDivisionById(id: number): Promise<DivisionDTO | null> {
    return await this.prisma.listDivisi.findUnique({ where: { id } });
  }

  public async getAllDivisions(): Promise<DivisionDTO[]> {
    return await this.prisma.listDivisi.findMany();
  }

  public async getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]> {
    // Ambil semua divisions dari database dalam satu query
    const allDivisions = await this.prisma.listDivisi.findMany({
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    const divisionMap: Record<number, DivisionWithChildrenDTO> = {};
    const rootDivisions: DivisionWithChildrenDTO[] = [];

    // Inisialisasi semua division dengan children kosong
    for (const division of allDivisions) {
      divisionMap[division.id] = { ...division, children: [] };
    }

    // Bangun hierarki dengan menambahkan setiap node ke parent-nya
    for (const division of allDivisions) {
      const parentId = division.parentId;
      if (parentId === null) {
        // Ini adalah root division
        rootDivisions.push(divisionMap[division.id]);
      } else if (divisionMap[parentId]) {
        // Gunakan type assertion untuk memastikan children tidak undefined
        const parentDivision = divisionMap[parentId];
        (parentDivision.children as DivisionWithChildrenDTO[]).push(
          divisionMap[division.id],
        );
      }
    }

    return rootDivisions;
  }

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

  public async getFilteredDivisions(
    whereClause: Prisma.ListDivisiWhereInput,
  ): Promise<DivisionDTO[]> {
    return await this.prisma.listDivisi.findMany({ where: whereClause });
  }

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

  public async updateDivision(
    id: number,
    data: Prisma.ListDivisiUpdateInput,
  ): Promise<DivisionDTO> {
    try {
      if (data.divisi !== undefined) {
        this.validateDivisionName(data.divisi as string | null);
      }

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
          throw new Error(`Division with ID ${id} not found`);
        }
        // P2002: Unique constraint violation
        if (error.code === "P2002") {
          throw new Error(`Division with this name already exists`);
        }
        // P2003: Foreign key constraint violation
        if (error.code === "P2003") {
          throw new Error(`Invalid parent division ID`);
        }
      }

      throw new Error(
        `Failed to update division with ID ${id}: ${errorMessage}`,
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

  // Cari semua anak langsung dari division dan
  // Rekursif untuk mendapatkan anak-anak dari setiap anak
  public async getAllChildrenIds(id: number): Promise<number[]> {
    const children =
      (await this.prisma.listDivisi.findMany({
        where: { parentId: id },
        select: { id: true },
      })) || []; // Default to empty array if no children found

    const childIds = children.map((child) => child.id);

    const descendants = await Promise.all(
      childIds.map((childId) => this.getAllChildrenIds(childId)),
    );

    return [...childIds, ...descendants.flat()];
  }

  public async deleteDivision(id: number): Promise<boolean> {
    try {
      const childrenIds = await this.getAllChildrenIds(id);

      await this.prisma.user.updateMany({
        where: {
          divisiId: { in: [...childrenIds, id] },
        },
        data: {
          divisiId: null,
        },
      });

      await this.prisma.listDivisi.deleteMany({
        where: {
          id: { in: [...childrenIds, id] },
        },
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to delete division with ID ${id}: ${errorMessage}`,
      );
    }
  }
}

export default DivisionRepository;
