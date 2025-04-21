import KomentarRepository from "../repository/komentar.repository";
import { KomentarDTO } from "../dto/komentar.dto";
import { Komentar } from "@prisma/client";

class KomentarService {
  private readonly komentarRepository: KomentarRepository;

  constructor() {
    this.komentarRepository = new KomentarRepository();
  }

  /**
   * Add a new comment
   */
  public async addKomentar(komentarData: KomentarDTO): Promise<Komentar> {
    return this.komentarRepository.addKomentar(komentarData);
  }

  
}

export default KomentarService;