import { DivisiDTO } from "../dto/divisi.dto";
import { IDivisiService } from "./interface/divisi.service.interface";
import DivisiRepository from "../repository/divisi.repository";

class DivisiService implements IDivisiService {
  private readonly divisiRepository: DivisiRepository;

  constructor() {
    this.divisiRepository = new DivisiRepository();
  }
  
  public async addDivisi(data: Partial<DivisiDTO>): Promise<DivisiDTO> {
    return await this.divisiRepository.addDivisi(data);
  }
}

export default DivisiService;