import { CreateRequestDTO, RequestResponseDTO } from "../../dto/request.dto";

export interface IRequestService {
  getRequestById(id: string): Promise<RequestResponseDTO>;
  getAllRequests(): Promise<RequestResponseDTO[]>;
  createRequest(requestData: CreateRequestDTO): Promise<RequestResponseDTO>;
}
