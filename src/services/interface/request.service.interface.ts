import { RequestResponseDTO, RequestDTO } from "../../dto/request.dto";

export interface IRequestService {
  getRequestById(id: string): Promise<RequestResponseDTO>;
  getAllRequests(): Promise<RequestResponseDTO[]>;
  getAllRequestMaintenance(): Promise<RequestDTO[]>;
}
