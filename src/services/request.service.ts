import { v4 as uuidv4 } from "uuid";
import { IRequestService } from "./interface/request.service.interface";
import { CreateRequestDTO, RequestResponseDTO } from "../dto/request.dto";
import RequestRepository from "../repository/request.repository";

class RequestService implements IRequestService {
  private readonly requestRepository: RequestRepository;

  constructor() {
    this.requestRepository = new RequestRepository();
  }

  public async createRequest(
    requestData: CreateRequestDTO,
  ): Promise<RequestResponseDTO> {
    try {
      const result = await this.requestRepository.createRequest({
        id: uuidv4(),
        ...requestData,
        status: "Pending",
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default RequestService;
