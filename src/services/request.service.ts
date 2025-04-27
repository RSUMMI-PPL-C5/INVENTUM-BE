import { RequestResponseDTO, RequestDTO } from "../dto/request.dto";
import RequestRepository from "../repository/request.repository";
import { IRequestService } from "./interface/request.service.interface";
import AppError from "../utils/appError";

export class RequestService implements IRequestService {
  private readonly requestRepository: RequestRepository;

  constructor() {
    this.requestRepository = new RequestRepository();
  }

  async getRequestById(id: string): Promise<RequestResponseDTO> {
    try {
      if (!id || typeof id !== "string" || id.trim() === "") {
        throw new AppError(
          "Request ID is required and must be a valid string",
          400,
        );
      }

      const request = await this.requestRepository.getRequestById(id);

      if (!request) {
        throw new AppError(`Request with ID ${id} not found`, 404);
      }

      return request;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error in getRequestById service:", error);
      throw new Error(
        `Failed to get request: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getAllRequests(): Promise<RequestResponseDTO[]> {
    try {
      const requests = await this.requestRepository.getAllRequests();
      return requests;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error in getAllRequests service:", error);
      throw new Error(
        `Failed to get requests: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getAllRequestMaintenance(): Promise<RequestDTO[]> {
    try {
      const requests = await this.requestRepository.getAllRequestMaintenance();
      return requests;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error in getAllRequestMaintenance service:", error);
      throw new Error(
        `Failed to get maintenance requests: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export default RequestService;
