import { IDivisionService } from "./interface/division.service.interface";
import { DivisionDTO, DivisionWithChildrenDTO } from "../dto/division.dto";
import DivisionRepository from "../repository/division.repository";

class DivisionService implements IDivisionService {
  private readonly divisionRepository: DivisionRepository;

  constructor(divisionRepository?: DivisionRepository) {
    // Dependency injection pattern - allows for easier testing
    this.divisionRepository = divisionRepository || new DivisionRepository();
  }

  /**
   * Get all divisions as a flat list
   */
  public async getAllDivisions(): Promise<DivisionDTO[]> {
    return await this.divisionRepository.getAllDivisions();
  }

  /**
   * Get hierarchical structure of divisions
   * Uses the Composite Pattern through the tree structure
   */
  public async getDivisionsHierarchy(): Promise<DivisionWithChildrenDTO[]> {
    return await this.divisionRepository.getDivisionsHierarchy();
  }

  /**
   * Get divisions with their user counts
   * Demonstrates the Decorator Pattern by adding additional information to divisions
   */
  public async getDivisionsWithUserCount(): Promise<
    Array<DivisionDTO & { userCount: number }>
  > {
    return await this.divisionRepository.getDivisionsWithUserCount();
  }

  public async deleteDivision(id: number): Promise<boolean> {
    return await this.divisionRepository.deleteDivision(id);
  }
}

// Singleton pattern implementation - ensures single instance throughout the application
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
