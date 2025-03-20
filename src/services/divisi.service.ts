import { DivisiDTO } from "../dto/divisi.dto";
import { IDivisiService } from "./interface/divisi.service.interface";
import DivisiRepository from "../repository/divisi.repository";

class DivisiService implements IDivisiService {
  private readonly divisiRepository: DivisiRepository;

  constructor() {
    this.divisiRepository = new DivisiRepository();
  }
  
  public async addDivisi(data: Partial<DivisiDTO>): Promise<DivisiDTO> {
    if (!data.parentId) {
      data.parentId = 1;
    }

    const parentExists = await this.divisiRepository.getDivisiById(data.parentId);
    
    if (!parentExists) {
      throw new Error('Parent divisi not found');
    }

    return await this.divisiRepository.addDivisi(data);
  }
}

export default DivisiService;