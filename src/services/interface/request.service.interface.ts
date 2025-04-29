import { CreateRequestDTO, RequestResponseDTO } from "../../dto/request.dto";

export interface IRequestService {
  createRequest(requestData: CreateRequestDTO): Promise<RequestResponseDTO>;
}
