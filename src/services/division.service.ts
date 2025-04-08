import { IDivisionService } from "./interface/division.service.interface";
import { DivisionDTO, DivisionWithChildrenDTO } from "../dto/division.dto";
import DivisionRepository from "../repository/division.repository";

class DivisionService implements IDivisionService {
  private readonly divisionRepository: DivisionRepository;

  constructor(divisionRepository?: DivisionRepository) {
    this.divisionRepository = divisionRepository || new DivisionRepository();
  }

  /**
   * Add a new division
   */
  public async addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO> {
    if (!data.parentId) {
      data.parentId = 59; // default parentId (Chief Operation Officer)
    }

    const parentExists = await this.divisionRepository.getDivisionById(data.parentId);
    if (!parentExists) {
      throw new Error("Parent divisi not found");
    }

    return await this.divisionRepository.addDivision(data);
  }

  /**
   * Get all divisions as a flat list
   */
  public async getAllDivisions(): Promise<DivisionDTO[]> {
    return await this.divisionRepository.getAllDivisions();
  }

  /**
   * Get hierarchical structure of divisions
   */
  public async getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]> {
    return await this.divisionRepository.getDivisionsHierarchy();
  }

  /**
   * Get divisions with their user counts
   */
  public async getDivisionsWithUserCount(): Promise<
    Array<DivisionDTO & { userCount: number }>
  > {
    return await this.divisionRepository.getDivisionsWithUserCount();
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
