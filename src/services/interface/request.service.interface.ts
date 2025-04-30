import {
  CreateRequestDTO,
  RequestResponseDTO,
  RequestDTO,
} from "../../dto/request.dto";

export interface IRequestService {
  getRequestById(id: string): Promise<RequestResponseDTO>;
  getAllRequests(): Promise<RequestResponseDTO[]>;
  getAllRequestMaintenance(): Promise<RequestDTO[]>;
  getAllRequestCalibration(): Promise<RequestDTO[]>;
  createRequest(requestData: CreateRequestDTO): Promise<RequestResponseDTO>;
}
