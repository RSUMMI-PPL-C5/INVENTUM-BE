import { DivisionDTO } from "../dto/division.dto";
import { IDivisionService } from "./interface/division.service.interface";
import DivisionRepository from "../repository/division.repository";

class DivisionService implements IDivisionService {
  private readonly divisionRepository: DivisionRepository;

  constructor() {
    this.divisionRepository = new DivisionRepository();
  }
  
  public async addDivision(data: Partial<DivisionDTO>): Promise<DivisionDTO> {
    if (!data.parentId) {
      data.parentId = 59; // default parentId (Chief Operation Officer)
    }

    const parentExists = await this.divisionRepository.getDivisionById(data.parentId);
    
    if (!parentExists) {
      throw new Error('Parent divisi not found');
    }

    return await this.divisionRepository.addDivision(data);
  }
}

export default DivisionService;