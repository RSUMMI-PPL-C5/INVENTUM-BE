import { v4 as uuidv4 } from "uuid";
import { CreateRequestDTO, RequestResponseDTO } from "../dto/request.dto";
import RequestRepository from "../repository/request.repository";
import { IRequestService } from "./interface/request.service.interface";
import AppError from "../utils/appError";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { RequestFilterOptions } from "../interfaces/request.filter.interface";
import WhatsAppService from "./whatsapp.service";
import NotificationService from "./notification.service";
import UserRepository from "../repository/user.repository";

class RequestService implements IRequestService {
  private readonly requestRepository: RequestRepository;
  private readonly userRepository: UserRepository;
  private readonly whatsappService: WhatsAppService;
  private readonly notificationService: NotificationService;

  constructor() {
    this.requestRepository = new RequestRepository();
    this.userRepository = new UserRepository();
    this.whatsappService = new WhatsAppService();
    this.notificationService = new NotificationService();
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

    const fasumUsers = await this.userRepository.getUsersByRole("Fasum");

    const whatsappPromises = fasumUsers.map(
      async (user: { id: string; waNumber: string | null }) => {
        if (user.waNumber) {
          const message = `Ada permintaan baru dari pengguna.\n\nPeralatan: ${requestData.medicalEquipment}\nKeluhan: ${
            requestData.complaint ?? "Tidak ada keluhan yang dicantumkan"
          }\nStatus: Menunggu tindak lanjut\n\nSilakan cek sistem untuk informasi lebih lanjut.`;

          try {
            await this.whatsappService.sendMessage(user.waNumber, message);
          } catch (error) {
            console.error(
              `Failed to send WhatsApp notification to ${user.waNumber}:`,
              error,
            );
          }
        }
      },
    );

    await Promise.allSettled(whatsappPromises);
    try {
      await this.notificationService.createRequestNotification(
        result.id,
        requestData.userId,
        requestData.requestType,
      );
    } catch (notificationError) {
      console.error("Failed to create notifications:", notificationError);
    }

    return { data: result };
  }

  public async updateRequestStatus(
    id: string,
    status: string,
  ): Promise<{ data: RequestResponseDTO }> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new AppError(
        "Request ID is required and must be a valid string",
        400,
      );
    }

    if (!status || typeof status !== "string" || status.trim() === "") {
      throw new AppError("Status is required and must be a valid string", 400);
    }

    const existingRequest = await this.requestRepository.getRequestById(id);
    if (!existingRequest) {
      throw new AppError(`Request with ID ${id} not found`, 404);
    }

    const updatedRequest = await this.requestRepository.updateRequestStatus(
      id,
      status,
    );

    return { data: updatedRequest };
  }
}

export default RequestService;
