import { v4 as uuidv4 } from "uuid";
import { CreateRequestDTO, RequestResponseDTO } from "../dto/request.dto";
import RequestRepository from "../repository/request.repository";
import { IRequestService } from "./interface/request.service.interface";
import AppError from "../utils/appError";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { RequestFilterOptions } from "../interfaces/request.filter.interface";

class RequestService implements IRequestService {
  private readonly requestRepository: RequestRepository;

  constructor() {
    this.requestRepository = new RequestRepository();
  }

  public async getRequestById(
    id: string,
  ): Promise<{ data: RequestResponseDTO }> {
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

    return { data: request };
  }

  public async getAllRequests(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { requests, total } = await this.requestRepository.getAllRequests(
      search,
      filters,
      pagination,
    );

    const totalPages = pagination
      ? Math.ceil(total / pagination.limit)
      : Math.ceil(total / 10);

    return {
      data: requests,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 10,
        totalPages,
      },
    };
  }

  public async getAllRequestMaintenance(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { requests, total } =
      await this.requestRepository.getAllRequestMaintenance(
        search,
        filters,
        pagination,
      );

    const totalPages = pagination
      ? Math.ceil(total / pagination.limit)
      : Math.ceil(total / 10);

    return {
      data: requests,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 10,
        totalPages,
      },
    };
  }

  public async getAllRequestCalibration(
    search?: string,
    filters?: RequestFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { requests, total } =
      await this.requestRepository.getAllRequestCalibration(
        search,
        filters,
        pagination,
      );

    const totalPages = pagination
      ? Math.ceil(total / pagination.limit)
      : Math.ceil(total / 10);

    return {
      data: requests,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 10,
        totalPages,
      },
    };
  }

  public async createRequest(
    requestData: CreateRequestDTO,
  ): Promise<{ data: RequestResponseDTO }> {
    const result = await this.requestRepository.createRequest({
      id: uuidv4(),
      ...requestData,
    });

    return { data: result };
  }
}

export default RequestService;
