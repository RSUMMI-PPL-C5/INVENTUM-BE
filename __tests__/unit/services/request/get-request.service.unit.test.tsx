import RequestService from "../../../../src/services/request.service";
import RequestRepository from "../../../../src/repository/request.repository";
import UserRepository from "../../../../src/repository/user.repository";
import WhatsAppService from "../../../../src/services/whatsapp.service";
import { RequestType } from "@prisma/client";
import { RequestResponseDTO } from "../../../../src/dto/request.dto";

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mocked-uuid"),
}));

// Mock the repository
jest.mock("../../../../src/repository/request.repository");

describe("RequestService", () => {
  let requestService: RequestService;
  let mockRequestRepository: jest.Mocked<RequestRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockWhatsappService: jest.Mocked<WhatsAppService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequestRepository =
      new RequestRepository() as jest.Mocked<RequestRepository>;
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockWhatsappService = new WhatsAppService() as jest.Mocked<WhatsAppService>;

    (RequestRepository as jest.Mock).mockImplementation(
      () => mockRequestRepository,
    );
    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
    (WhatsAppService as jest.Mock).mockImplementation(
      () => mockWhatsappService,
    );

    mockRequestRepository.updateRequestStatus = jest.fn();

    // Initialize the service
    requestService = new RequestService();
    (requestService as any).userRepository = mockUserRepository;
    (requestService as any).whatsappService = mockWhatsappService;
  });

  const createMockRequest = (overrides = {}) => ({
    id: "request-1",
    userId: "user-123",
    medicalEquipment: "test equipment",
    complaint: "Test complaint",
    status: "Pending",
    createdBy: "user-123",
    createdOn: new Date(),
    modifiedBy: "user-123",
    modifiedOn: new Date(),
    requestType: RequestType.MAINTENANCE,
    user: {
      id: "user-123",
      fullname: "Test User",
      username: "testuser",
    },
    comments: [],
    notifications: [],
    ...overrides,
  });

  describe("getRequestById", () => {
    it("should successfully get a request by ID", async () => {
      // Mock data
      const requestId = "request-123";
      const mockRequest: any = {
        id: requestId,
        medicalEquipment: "Equipment Name",
        userId: "user-123",
      };

      // Mock repository method
      mockRequestRepository.getRequestById.mockResolvedValue(mockRequest);

      // Call service method
      const result = await requestService.getRequestById(requestId);

      // Assertions
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
      expect(result).toEqual({ data: mockRequest });
    });

    it("should throw an error if request ID is invalid", async () => {
      // Assertions for empty string
      await expect(requestService.getRequestById("")).rejects.toThrow(
        "Request ID is required and must be a valid string",
      );

      // Assertions for null
      await expect(
        requestService.getRequestById(null as unknown as string),
      ).rejects.toThrow("Request ID is required and must be a valid string");

      // Assertions for whitespace-only string
      await expect(requestService.getRequestById("   ")).rejects.toThrow(
        "Request ID is required and must be a valid string",
      );

      // Ensure repository method wasn't called
      expect(mockRequestRepository.getRequestById).not.toHaveBeenCalled();
    });

    it("should throw an error if request is not found", async () => {
      // Mock data
      const requestId = "nonexistent-id";

      // Mock repository method to return null (not found)
      mockRequestRepository.getRequestById.mockResolvedValue(null);

      // Assertions
      await expect(requestService.getRequestById(requestId)).rejects.toThrow(
        `Request with ID ${requestId} not found`,
      );
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
    });

    it("should pass through repository errors", async () => {
      // Mock data
      const requestId = "request-123";
      const mockError = new Error("Repository error");

      // Mock repository error
      mockRequestRepository.getRequestById.mockRejectedValue(mockError);

      // Assertions - should pass through the original error
      await expect(requestService.getRequestById(requestId)).rejects.toEqual(
        mockError,
      );
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
    });
  });

  describe("getAllRequests", () => {
    it("should successfully get all requests", async () => {
      // Mock data
      const mockRequests = {
        requests: [
          { id: "request-1", medicalEquipment: "Equipment 1" },
          { id: "request-2", medicalEquipment: "Equipment 2" },
        ],
        total: 2,
      } as { requests: RequestResponseDTO[]; total: number };

      // Mock repository method
      mockRequestRepository.getAllRequests.mockResolvedValue(mockRequests);

      // Call service method
      const result = await requestService.getAllRequests();

      // Assertions
      expect(mockRequestRepository.getAllRequests).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should correctly handle pagination parameters", async () => {
      // Mock data
      const mockRequests = {
        requests: [
          { id: "request-1", medicalEquipment: "Equipment 1" },
          { id: "request-2", medicalEquipment: "Equipment 2" },
        ],
        total: 25,
      } as { requests: RequestResponseDTO[]; total: number };

      const pagination = { page: 2, limit: 10 };

      // Mock repository method
      mockRequestRepository.getAllRequests.mockResolvedValue(mockRequests);

      // Call service method
      const result = await requestService.getAllRequests(
        undefined,
        undefined,
        pagination,
      );

      // Assertions
      expect(mockRequestRepository.getAllRequests).toHaveBeenCalledWith(
        undefined,
        undefined,
        pagination,
      );
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3, // ceiling of 25/10 = 3
        },
      });
    });

    it("should handle small limit values correctly for pagination", async () => {
      // Mock data with a total of 5 items
      const mockRequests = {
        requests: [{ id: "request-1", medicalEquipment: "Equipment 1" }],
        total: 5,
      } as { requests: RequestResponseDTO[]; total: number };

      // Pagination with small limit
      const pagination = { page: 1, limit: 2 };

      // Mock repository method
      mockRequestRepository.getAllRequests.mockResolvedValue(mockRequests);

      // Call service method
      const result = await requestService.getAllRequests(
        undefined,
        undefined,
        pagination,
      );

      // Assertions
      expect(result.meta.totalPages).toBe(3); // ceiling of 5/2 = 3
    });

    it("should pass through repository errors", async () => {
      // Mock error
      const mockError = new Error("Repository error");

      // Mock repository error
      mockRequestRepository.getAllRequests.mockRejectedValue(mockError);

      // Assertions
      await expect(requestService.getAllRequests()).rejects.toEqual(mockError);
      expect(mockRequestRepository.getAllRequests).toHaveBeenCalled();
    });

    it("should handle search and filters correctly", async () => {
      const search = "test equipment";
      const filters = { status: ["Pending", "Processing"] };
      const pagination = { page: 2, limit: 5 };

      const mockRequests = {
        requests: [createMockRequest({ medicalEquipment: "test equipment" })],
        total: 1,
      };

      mockRequestRepository.getAllRequests.mockResolvedValue(mockRequests);

      const result = await requestService.getAllRequests(
        search,
        filters,
        pagination,
      );

      expect(mockRequestRepository.getAllRequests).toHaveBeenCalledWith(
        search,
        filters,
        pagination,
      );
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 1,
          page: 2,
          limit: 5,
          totalPages: 1,
        },
      });
    });

    it("should handle zero results correctly", async () => {
      const mockRequests = {
        requests: [],
        total: 0,
      };

      mockRequestRepository.getAllRequests.mockResolvedValue(mockRequests);

      const result = await requestService.getAllRequests();

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it("should handle large total values correctly", async () => {
      const mockRequests = {
        requests: [createMockRequest()],
        total: 100,
      };

      mockRequestRepository.getAllRequests.mockResolvedValue(mockRequests);

      const result = await requestService.getAllRequests(undefined, undefined, {
        page: 2,
        limit: 10,
      });

      expect(result.meta.totalPages).toBe(10); // 100/10 = 10 pages
    });
  });

  describe("getAllRequestMaintenance", () => {
    it("should successfully get all maintenance requests", async () => {
      // Mock data
      const mockRequests = {
        requests: [
          {
            id: "request-1",
            medicalEquipment: "Equipment 1",
            requestType: "MAINTENANCE",
          },
          {
            id: "request-2",
            medicalEquipment: "Equipment 2",
            requestType: "MAINTENANCE",
          },
        ],
        total: 2,
      } as { requests: RequestResponseDTO[]; total: number };

      // Mock repository method
      mockRequestRepository.getAllRequestMaintenance.mockResolvedValue(
        mockRequests,
      );

      // Call service method
      const result = await requestService.getAllRequestMaintenance();

      // Assertions
      expect(mockRequestRepository.getAllRequestMaintenance).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should correctly handle pagination parameters for maintenance requests", async () => {
      // Mock data
      const mockRequests = {
        requests: [
          {
            id: "request-1",
            medicalEquipment: "Equipment 1",
            requestType: "MAINTENANCE",
          },
        ],
        total: 15,
      } as { requests: RequestResponseDTO[]; total: number };

      const pagination = { page: 2, limit: 5 };

      // Mock repository method
      mockRequestRepository.getAllRequestMaintenance.mockResolvedValue(
        mockRequests,
      );

      // Call service method
      const result = await requestService.getAllRequestMaintenance(
        undefined,
        undefined,
        pagination,
      );

      // Assertions
      expect(
        mockRequestRepository.getAllRequestMaintenance,
      ).toHaveBeenCalledWith(undefined, undefined, pagination);
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 15,
          page: 2,
          limit: 5,
          totalPages: 3, // ceiling of 15/5 = 3
        },
      });
    });

    it("should handle search and filters for maintenance requests", async () => {
      // Mock data
      const mockRequests = {
        requests: [{ id: "request-1", medicalEquipment: "Specific Equipment" }],
        total: 1,
      } as { requests: RequestResponseDTO[]; total: number };

      const search = "Specific";
      const filters = { status: ["Pending"] };

      // Mock repository method
      mockRequestRepository.getAllRequestMaintenance.mockResolvedValue(
        mockRequests,
      );

      // Call service method
      const result = await requestService.getAllRequestMaintenance(
        search,
        filters,
      );

      // Assertions
      expect(
        mockRequestRepository.getAllRequestMaintenance,
      ).toHaveBeenCalledWith(search, filters, undefined);
      expect(result.data).toEqual(mockRequests.requests);
    });

    it("should pass through repository errors", async () => {
      // Mock error
      const mockError = new Error("Repository error");

      // Mock repository error
      mockRequestRepository.getAllRequestMaintenance.mockRejectedValue(
        mockError,
      );

      // Assertions
      await expect(requestService.getAllRequestMaintenance()).rejects.toEqual(
        mockError,
      );
      expect(mockRequestRepository.getAllRequestMaintenance).toHaveBeenCalled();
    });

    it("should handle search and filters correctly", async () => {
      const search = "maintenance equipment";
      const filters = { status: ["Pending"] };
      const pagination = { page: 2, limit: 5 };

      const mockRequests = {
        requests: [
          createMockRequest({
            medicalEquipment: "maintenance equipment",
            requestType: RequestType.MAINTENANCE,
          }),
        ],
        total: 1,
      };

      mockRequestRepository.getAllRequestMaintenance.mockResolvedValue(
        mockRequests,
      );

      const result = await requestService.getAllRequestMaintenance(
        search,
        filters,
        pagination,
      );

      expect(
        mockRequestRepository.getAllRequestMaintenance,
      ).toHaveBeenCalledWith(search, filters, pagination);
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 1,
          page: 2,
          limit: 5,
          totalPages: 1,
        },
      });
    });

    it("should handle zero results correctly", async () => {
      const mockRequests = {
        requests: [],
        total: 0,
      };

      mockRequestRepository.getAllRequestMaintenance.mockResolvedValue(
        mockRequests,
      );

      const result = await requestService.getAllRequestMaintenance();

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it("should handle large total values correctly", async () => {
      const mockRequests = {
        requests: [createMockRequest({ requestType: RequestType.MAINTENANCE })],
        total: 100,
      };

      mockRequestRepository.getAllRequestMaintenance.mockResolvedValue(
        mockRequests,
      );

      const result = await requestService.getAllRequestMaintenance(
        undefined,
        undefined,
        { page: 2, limit: 10 },
      );

      expect(result.meta.totalPages).toBe(10); // 100/10 = 10 pages
    });
  });

  describe("getAllRequestCalibration", () => {
    it("should successfully get all calibration requests", async () => {
      // Mock data
      const mockRequests = {
        requests: [
          {
            id: "request-1",
            medicalEquipment: "Equipment 1",
            requestType: "CALIBRATION",
          },
          {
            id: "request-2",
            medicalEquipment: "Equipment 2",
            requestType: "CALIBRATION",
          },
        ],
        total: 2,
      } as { requests: RequestResponseDTO[]; total: number };

      // Mock repository method
      mockRequestRepository.getAllRequestCalibration.mockResolvedValue(
        mockRequests,
      );

      // Call service method
      const result = await requestService.getAllRequestCalibration();

      // Assertions
      expect(mockRequestRepository.getAllRequestCalibration).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should correctly handle pagination parameters for calibration requests", async () => {
      // Mock data
      const mockRequests = {
        requests: [
          {
            id: "request-1",
            medicalEquipment: "Equipment 1",
            requestType: "CALIBRATION",
          },
        ],
        total: 21,
      } as { requests: RequestResponseDTO[]; total: number };

      const pagination = { page: 3, limit: 7 };

      // Mock repository method
      mockRequestRepository.getAllRequestCalibration.mockResolvedValue(
        mockRequests,
      );

      // Call service method
      const result = await requestService.getAllRequestCalibration(
        undefined,
        undefined,
        pagination,
      );

      // Assertions
      expect(
        mockRequestRepository.getAllRequestCalibration,
      ).toHaveBeenCalledWith(undefined, undefined, pagination);
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 21,
          page: 3,
          limit: 7,
          totalPages: 3, // ceiling of 21/7 = 3
        },
      });
    });

    it("should handle search and filters for calibration requests", async () => {
      // Mock data
      const mockRequests = {
        requests: [
          { id: "request-1", medicalEquipment: "Specific Instrument" },
        ],
        total: 1,
      } as { requests: RequestResponseDTO[]; total: number };

      const search = "Instrument";
      const filters = { status: ["Processing"] };

      // Mock repository method
      mockRequestRepository.getAllRequestCalibration.mockResolvedValue(
        mockRequests,
      );

      // Call service method
      const result = await requestService.getAllRequestCalibration(
        search,
        filters,
      );

      // Assertions
      expect(
        mockRequestRepository.getAllRequestCalibration,
      ).toHaveBeenCalledWith(search, filters, undefined);
      expect(result.data).toEqual(mockRequests.requests);
    });

    it("should handle search and filters correctly", async () => {
      const search = "calibration equipment";
      const filters = { status: ["Pending"] };
      const pagination = { page: 2, limit: 5 };

      const mockRequests = {
        requests: [
          createMockRequest({
            medicalEquipment: "calibration equipment",
            requestType: RequestType.CALIBRATION,
          }),
        ],
        total: 1,
      };

      mockRequestRepository.getAllRequestCalibration.mockResolvedValue(
        mockRequests,
      );

      const result = await requestService.getAllRequestCalibration(
        search,
        filters,
        pagination,
      );

      expect(
        mockRequestRepository.getAllRequestCalibration,
      ).toHaveBeenCalledWith(search, filters, pagination);
      expect(result).toEqual({
        data: mockRequests.requests,
        meta: {
          total: 1,
          page: 2,
          limit: 5,
          totalPages: 1,
        },
      });
    });

    it("should handle zero results correctly", async () => {
      const mockRequests = {
        requests: [],
        total: 0,
      };

      mockRequestRepository.getAllRequestCalibration.mockResolvedValue(
        mockRequests,
      );

      const result = await requestService.getAllRequestCalibration();

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it("should handle large total values correctly", async () => {
      const mockRequests = {
        requests: [createMockRequest({ requestType: RequestType.CALIBRATION })],
        total: 100,
      };

      mockRequestRepository.getAllRequestCalibration.mockResolvedValue(
        mockRequests,
      );

      const result = await requestService.getAllRequestCalibration(
        undefined,
        undefined,
        { page: 2, limit: 10 },
      );

      expect(result.meta.totalPages).toBe(10); // 100/10 = 10 pages
    });

    it("should pass through repository errors", async () => {
      // Mock error
      const mockError = new Error("Repository error");

      // Mock repository error
      mockRequestRepository.getAllRequestCalibration.mockRejectedValue(
        mockError,
      );

      // Assertions
      await expect(requestService.getAllRequestCalibration()).rejects.toEqual(
        mockError,
      );
      expect(mockRequestRepository.getAllRequestCalibration).toHaveBeenCalled();
    });
  });

  describe("createRequest", () => {
    it("should create a request successfully and send WhatsApp notifications", async () => {
      const mockRequestData = {
        userId: "user-123",
        medicalEquipment: "Test Equipment",
        complaint: "Test complaint",
        createdBy: "user-123",
        requestType: RequestType.MAINTENANCE,
      };

      const mockRequest = createMockRequest(mockRequestData);
      mockRequestRepository.createRequest.mockResolvedValue(mockRequest);

      const mockFasumUsers = [
        { id: "user-1", waNumber: "1234567890" },
        { id: "user-2", waNumber: "0987654321" },
      ];
      mockUserRepository.getUsersByRole.mockResolvedValue(mockFasumUsers);

      const result = await requestService.createRequest(mockRequestData);

      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: expect.any(String),
        ...mockRequestData,
      });
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: mockRequest });
    });

    it("should create a request successfully even if WhatsApp notifications fail", async () => {
      const mockRequestData = {
        userId: "user-123",
        medicalEquipment: "Test Equipment",
        complaint: "Test complaint",
        createdBy: "user-123",
        requestType: RequestType.MAINTENANCE,
      };

      const mockRequest = createMockRequest(mockRequestData);
      mockRequestRepository.createRequest.mockResolvedValue(mockRequest);

      const mockFasumUsers = [{ id: "user-1", waNumber: "1234567890" }];
      mockUserRepository.getUsersByRole.mockResolvedValue(mockFasumUsers);
      mockWhatsappService.sendMessage.mockRejectedValue(
        new Error("Failed to send message"),
      );

      const result = await requestService.createRequest(mockRequestData);

      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: expect.any(String),
        ...mockRequestData,
      });
      expect(result).toEqual({ data: mockRequest });
    });

    it("should create a request successfully when no Fasum users exist", async () => {
      const mockRequestData = {
        userId: "user-123",
        medicalEquipment: "Test Equipment",
        complaint: "Test complaint",
        createdBy: "user-123",
        requestType: RequestType.MAINTENANCE,
      };

      const mockRequest = createMockRequest(mockRequestData);
      mockRequestRepository.createRequest.mockResolvedValue(mockRequest);
      mockUserRepository.getUsersByRole.mockResolvedValue([]);

      const result = await requestService.createRequest(mockRequestData);

      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: expect.any(String),
        ...mockRequestData,
      });
      expect(mockWhatsappService.sendMessage).not.toHaveBeenCalled();
      expect(result).toEqual({ data: mockRequest });
    });

    it("should create a calibration request successfully and send WhatsApp notifications", async () => {
      const mockRequestData = {
        userId: "user-123",
        medicalEquipment: "Test Equipment",
        complaint: "Test complaint",
        createdBy: "user-123",
        requestType: RequestType.CALIBRATION,
      };

      const mockRequest = createMockRequest(mockRequestData);
      mockRequestRepository.createRequest.mockResolvedValue(mockRequest);

      const mockFasumUsers = [{ id: "user-1", waNumber: "1234567890" }];
      mockUserRepository.getUsersByRole.mockResolvedValue(mockFasumUsers);

      const result = await requestService.createRequest(mockRequestData);

      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: expect.any(String),
        ...mockRequestData,
      });
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockRequest });
    });

    it("should pass through repository errors", async () => {
      // Mock data
      const mockRequestData = {
        userId: "user-123",
        medicalEquipment: "Equipment Name",
        createdBy: "user-123",
        requestType: "MAINTENANCE" as const,
      };

      const mockError = new Error("Repository error");

      // Mock repository error
      mockRequestRepository.createRequest.mockRejectedValue(mockError);

      // Assertions
      await expect(
        requestService.createRequest(mockRequestData),
      ).rejects.toEqual(mockError);
      expect(mockRequestRepository.createRequest).toHaveBeenCalled();
    });
  });

  describe("updateRequestStatus", () => {
    it("should update request status successfully", async () => {
      const mockRequest = createMockRequest({
        id: "request-1",
        status: "Pending",
        requestType: RequestType.MAINTENANCE,
      });

      mockRequestRepository.getRequestById.mockResolvedValue(mockRequest);
      mockRequestRepository.updateRequestStatus.mockResolvedValue({
        ...mockRequest,
        status: "Processing",
      });

      const result = await requestService.updateRequestStatus(
        "request-1",
        "Processing",
      );

      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        "request-1",
      );
      expect(mockRequestRepository.updateRequestStatus).toHaveBeenCalledWith(
        "request-1",
        "Processing",
      );
      expect(result).toEqual({
        data: {
          ...mockRequest,
          status: "Processing",
        },
      });
    });

    it("should throw error if request not found", async () => {
      mockRequestRepository.getRequestById.mockResolvedValue(null);

      await expect(
        requestService.updateRequestStatus("request-1", "Processing"),
      ).rejects.toThrow("Request with ID request-1 not found");
    });

    it("should throw error if request ID is invalid", async () => {
      await expect(
        requestService.updateRequestStatus("", "Processing"),
      ).rejects.toThrow("Request ID is required and must be a valid string");
    });

    it("should throw error if status is invalid", async () => {
      await expect(
        requestService.updateRequestStatus("request-1", ""),
      ).rejects.toThrow("Status is required and must be a valid string");
    });
  });
});
