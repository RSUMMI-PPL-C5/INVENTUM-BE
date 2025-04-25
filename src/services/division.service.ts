import { IDivisionService } from "./interface/division.service.interface";
import { DivisionDTO, DivisionWithChildrenDTO } from "../dto/division.dto";
import DivisionRepository from "../repository/division.repository";
import AppError from "../utils/appError";
import { Prisma } from "@prisma/client";

class DivisionService implements IDivisionService {
  private readonly divisionRepository: DivisionRepository;

  constructor(divisionRepository?: DivisionRepository) {
    this.divisionRepository = divisionRepository || new DivisionRepository();
  }

  public async addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO> {
    if (data.parentId === null || data.parentId === undefined) {
      data.parentId = null;
    } else {
      const parentExists = await this.divisionRepository.getDivisionById(
        data.parentId,
      );
      if (!parentExists) {
        throw new Error("Parent divisi not found");
      }
    }

    return await this.divisionRepository.addDivision(data);
  }

  public async getAllDivisions(): Promise<DivisionDTO[]> {
    return await this.divisionRepository.getAllDivisions();
  }

  public async getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]> {
    return await this.divisionRepository.getDivisionsHierarchy();
  }

  public async getDivisionsWithUserCount(): Promise<
    Array<DivisionDTO & { userCount: number }>
  > {
    return await this.divisionRepository.getDivisionsWithUserCount();
  }

  public async updateDivision(
    id: number,
    updateData: { divisi?: string; parentId?: number | null },
  ): Promise<DivisionDTO> {
    const existingDivision = await this.divisionRepository.getDivisionById(id);
    if (!existingDivision) {
      throw new AppError(`Division with ID ${id} not found`, 404);
    }

    // Validate parentId if provided
    if (updateData.parentId !== undefined) {
      await this.validateParentId(id, updateData.parentId);
    }

    // Prepare data for update using the correct Prisma update input type
    const data: Prisma.ListDivisiUpdateInput = {};

    if (updateData.divisi !== undefined) {
      data.divisi = updateData.divisi;
    }

    if (updateData.parentId !== undefined) {
      if (updateData.parentId === null) {
        // bikin jadi root
        data.parent = { disconnect: true };
      } else {
        // Connect new parent
        data.parent = { connect: { id: updateData.parentId } };
      }
    }

    try {
      return await this.divisionRepository.updateDivision(id, data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AppError(`Failed to update division: ${errorMessage}`, 500);
    }
  }

  private async validateParentId(
    id: number,
    parentId: number | null,
  ): Promise<void> {
    if (parentId !== null) {
      const parentExists =
        await this.divisionRepository.getDivisionById(parentId);
      if (!parentExists) {
        throw new AppError(
          `Parent division with ID ${parentId} not found`,
          404,
        );
      }
      if (parentId === id) {
        throw new AppError("Division cannot be its own parent", 400);
      }
      const hasCycle = await this.divisionRepository.hasCircularReference(
        parentId,
        id,
      );
      if (hasCycle) {
        throw new AppError(
          "Cannot set a descendant as parent (would create a cycle)",
          400,
        );
      }
    }
  }

  public async deleteDivision(id: number): Promise<boolean> {
    return await this.divisionRepository.deleteDivision(id);
  }

  public async getDivisionById(id: number): Promise<DivisionDTO | null> {
    return await this.divisionRepository.getDivisionById(id);
  }
}

// Singleton pattern implementation
class DivisionServiceSingleton {
  private static instance: DivisionService;

  private constructor() {}

  public static getInstance(): DivisionService {
    if (!DivisionServiceSingleton.instance) {
      DivisionServiceSingleton.instance = new DivisionService();
    }
    return DivisionServiceSingleton.instance;
  }
}

export default DivisionService;
export { DivisionServiceSingleton };
