import RequestService from "../../../../src/services/request.service";
import RequestRepository from "../../../../src/repository/request.repository";
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

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequestRepository =
      new RequestRepository() as jest.Mocked<RequestRepository>;

    (RequestRepository as jest.Mock).mockImplementation(
      () => mockRequestRepository,
    );

    mockRequestRepository.updateRequestStatus = jest.fn();

    // Initialize the service
    requestService = new RequestService();
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

    it("should handle zero total results correctly", async () => {
      // Mock data with zero results
      const mockRequests = {
        requests: [],
        total: 0,
      } as { requests: RequestResponseDTO[]; total: number };

      // Mock repository method
      mockRequestRepository.getAllRequestCalibration.mockResolvedValue(
        mockRequests,
      );

      // Call service method
      const result = await requestService.getAllRequestCalibration();

      // Assertions
      expect(result.meta.totalPages).toBe(0); // total/10 = 0
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
    it("should successfully create a request", async () => {
      // Mock data
      const mockRequestData = {
        userId: "user-123",
        medicalEquipment: "Equipment Name",
        complaint: "Issue description",
        createdBy: "user-123",
        requestType: "MAINTENANCE" as const,
      };

      const mockCreatedRequest = {
        id: "mocked-uuid",
        ...mockRequestData,
        status: "Pending",
      };

      // Mock repository method
      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);

      // Call service method
      const result = await requestService.createRequest(mockRequestData);

      // Assertions
      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: "mocked-uuid",
        ...mockRequestData,
      });
      expect(result).toEqual({ data: mockCreatedRequest });
    });

    it("should handle creating a request without optional fields", async () => {
      // Mock data without complaint
      const mockRequestData = {
        userId: "user-123",
        medicalEquipment: "Equipment Name",
        createdBy: "user-123",
        requestType: "MAINTENANCE" as const,
      };

      const mockCreatedRequest = {
        id: "mocked-uuid",
        ...mockRequestData,
        status: "Pending",
      };

      // Mock repository method
      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);

      // Call service method
      const result = await requestService.createRequest(mockRequestData);

      // Assertions
      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: "mocked-uuid",
        ...mockRequestData,
      });
      expect(result).toEqual({ data: mockCreatedRequest });
    });

    it("should handle creating a calibration request", async () => {
      // Mock data for calibration
      const mockRequestData = {
        userId: "user-123",
        medicalEquipment: "Calibration Equipment",
        createdBy: "user-123",
        requestType: "CALIBRATION" as const,
      };

      const mockCreatedRequest = {
        id: "mocked-uuid",
        ...mockRequestData,
        status: "Pending",
      };

      // Mock repository method
      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);

      // Call service method
      const result = await requestService.createRequest(mockRequestData);

      // Assertions
      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: "mocked-uuid",
        ...mockRequestData,
      });
      expect(result).toEqual({ data: mockCreatedRequest });
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
    it("should successfully update request status", async () => {
      // Mock data
      const requestId = "request-123";
      const newStatus = "Completed";

      const existingRequest = {
        id: requestId,
        status: "Pending",
        medicalEquipment: "Equipment Name",
      };

      const updatedRequest = {
        ...existingRequest,
        status: newStatus,
      };

      // Mock repository methods
      mockRequestRepository.getRequestById.mockResolvedValue(
        existingRequest as any,
      );
      mockRequestRepository.updateRequestStatus.mockResolvedValue(
        updatedRequest as any,
      );

      // Call service method
      const result = await requestService.updateRequestStatus(
        requestId,
        newStatus,
      );

      // Assertions
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
      expect(mockRequestRepository.updateRequestStatus).toHaveBeenCalledWith(
        requestId,
        newStatus,
      );
      expect(result).toEqual({ data: updatedRequest });
    });

    it("should throw an error if request ID is invalid", async () => {
      // Assertions for empty string
      await expect(
        requestService.updateRequestStatus("", "Completed"),
      ).rejects.toThrow("Request ID is required and must be a valid string");

      // Assertions for null
      await expect(
        requestService.updateRequestStatus(
          null as unknown as string,
          "Completed",
        ),
      ).rejects.toThrow("Request ID is required and must be a valid string");

      // Ensure repository method wasn't called
      expect(mockRequestRepository.updateRequestStatus).not.toHaveBeenCalled();
    });

    it("should throw an error if status is invalid", async () => {
      // Assertions for empty string
      await expect(
        requestService.updateRequestStatus("request-123", ""),
      ).rejects.toThrow("Status is required and must be a valid string");

      // Assertions for null
      await expect(
        requestService.updateRequestStatus(
          "request-123",
          null as unknown as string,
        ),
      ).rejects.toThrow("Status is required and must be a valid string");

      // Ensure repository method wasn't called
      expect(mockRequestRepository.updateRequestStatus).not.toHaveBeenCalled();
    });

    it("should throw an error if request is not found", async () => {
      // Mock data
      const requestId = "nonexistent-id";
      const newStatus = "Completed";

      // Mock repository method to return null (not found)
      mockRequestRepository.getRequestById.mockResolvedValue(null);

      // Assertions
      await expect(
        requestService.updateRequestStatus(requestId, newStatus),
      ).rejects.toThrow(`Request with ID ${requestId} not found`);
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
      expect(mockRequestRepository.updateRequestStatus).not.toHaveBeenCalled();
    });

    it("should pass through repository errors from getRequestById", async () => {
      // Mock data
      const requestId = "request-123";
      const newStatus = "Completed";
      const mockError = new Error("Repository error");

      // Mock repository error
      mockRequestRepository.getRequestById.mockRejectedValue(mockError);

      // Assertions
      await expect(
        requestService.updateRequestStatus(requestId, newStatus),
      ).rejects.toEqual(mockError);
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
      expect(mockRequestRepository.updateRequestStatus).not.toHaveBeenCalled();
    });

    it("should pass through repository errors from updateRequestStatus", async () => {
      // Mock data
      const requestId = "request-123";
      const newStatus = "Completed";
      const mockError = new Error("Update error");

      const existingRequest = {
        id: requestId,
        status: "Pending",
        medicalEquipment: "Equipment Name",
      };

      // Mock repository methods
      mockRequestRepository.getRequestById.mockResolvedValue(
        existingRequest as any,
      );
      mockRequestRepository.updateRequestStatus.mockRejectedValue(mockError);

      // Assertions
      await expect(
        requestService.updateRequestStatus(requestId, newStatus),
      ).rejects.toEqual(mockError);
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
      expect(mockRequestRepository.updateRequestStatus).toHaveBeenCalledWith(
        requestId,
        newStatus,
      );
    });
  });
});
