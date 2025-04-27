import RequestService from "../../../../src/services/request.service";
import RequestRepository from "../../../../src/repository/request.repository";
import AppError from "../../../../src/utils/appError";

// Mock the repository
jest.mock("../../../../src/repository/request.repository");

describe("RequestService", () => {
  let requestService: RequestService;
  let mockRequestRepository: jest.Mocked<RequestRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock repository instance
    mockRequestRepository =
      new RequestRepository() as jest.Mocked<RequestRepository>;

    // Mock the constructor to return our mock repository
    (RequestRepository as jest.Mock).mockImplementation(
      () => mockRequestRepository,
    );

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
      expect(result).toBe(mockRequest);
    });

    it("should throw an error if request ID is invalid", async () => {
      // Assertions for empty string
      await expect(requestService.getRequestById("")).rejects.toThrow(AppError);

      // Assertions for null
      await expect(
        requestService.getRequestById(null as unknown as string),
      ).rejects.toThrow(AppError);

      // Assertions for whitespace-only string
      await expect(requestService.getRequestById("   ")).rejects.toThrow(
        AppError,
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
        AppError,
      );
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
    });

    it("should handle repository errors", async () => {
      // Mock data
      const requestId = "request-123";

      // Mock repository error
      mockRequestRepository.getRequestById.mockRejectedValue(
        new Error("Repository error"),
      );

      // Assertions
      await expect(requestService.getRequestById(requestId)).rejects.toThrow();
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
    });

    it("should handle non-Error rejections from repository", async () => {
      // Mock data
      const requestId = "request-123";

      // Mock repository rejecting with a string (not an Error object)
      mockRequestRepository.getRequestById.mockRejectedValue(
        "Some string error",
      );

      // Assertions
      await expect(requestService.getRequestById(requestId)).rejects.toThrow(
        "Failed to get request",
      );
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
    });

    it("should handle undefined rejections from repository", async () => {
      // Mock data
      const requestId = "request-123";

      // Mock repository rejecting with undefined
      mockRequestRepository.getRequestById.mockRejectedValue(undefined);

      // Assertions
      await expect(requestService.getRequestById(requestId)).rejects.toThrow(
        "Failed to get request: Unknown error",
      );
      expect(mockRequestRepository.getRequestById).toHaveBeenCalledWith(
        requestId,
      );
    });

    // Add these additional test cases

    it("should properly handle AppError instances by passing them through", async () => {
      // Mock data
      const requestId = "request-123";

      // Create an AppError instance
      const appError = new AppError("Custom error message", 418);

      // Mock repository method to reject with the AppError
      mockRequestRepository.getRequestById.mockRejectedValue(appError);

      // Assertions - should pass through the original AppError
      await expect(requestService.getRequestById(requestId)).rejects.toEqual(
        appError,
      );

      // Ensure the statusCode is preserved
      try {
        await requestService.getRequestById(requestId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(418);
      }
    });

    it("should properly format error messages for different types of errors", async () => {
      const requestId = "request-123";

      // Test with Error instance containing message
      mockRequestRepository.getRequestById.mockRejectedValue(
        new Error("Database connection failed"),
      );
      await expect(requestService.getRequestById(requestId)).rejects.toThrow(
        "Failed to get request: Database connection failed",
      );

      // Test with object that's not an Error
      mockRequestRepository.getRequestById.mockRejectedValue({
        custom: "error",
      });
      await expect(requestService.getRequestById(requestId)).rejects.toThrow(
        "Failed to get request: Unknown error",
      );

      // Test with null rejection
      mockRequestRepository.getRequestById.mockRejectedValue(null);
      await expect(requestService.getRequestById(requestId)).rejects.toThrow(
        "Failed to get request: Unknown error",
      );
    });
  });

  describe("getAllRequests", () => {
    it("should properly handle AppError instances by passing them through in getAllRequests", async () => {
      // Create an AppError instance
      const appError = new AppError(
        "Custom error message for getAllRequests",
        418,
      );

      // Mock repository method to reject with the AppError
      mockRequestRepository.getAllRequests.mockRejectedValue(appError);

      // Assertions - should pass through the original AppError
      await expect(requestService.getAllRequests()).rejects.toEqual(appError);

      // Ensure the statusCode is preserved
      try {
        await requestService.getAllRequests();
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(418);
      }
    });

    it("should successfully get all requests", async () => {
      // Mock data
      const mockRequests: any[] = [
        { id: "request-1", medicalEquipment: "Equipment 1" },
        { id: "request-2", medicalEquipment: "Equipment 2" },
      ];

      // Mock repository method
      mockRequestRepository.getAllRequests.mockResolvedValue(mockRequests);

      // Call service method
      const result = await requestService.getAllRequests();

      // Assertions
      expect(mockRequestRepository.getAllRequests).toHaveBeenCalled();
      expect(result).toBe(mockRequests);
    });

    it("should handle repository errors", async () => {
      // Mock repository error
      mockRequestRepository.getAllRequests.mockRejectedValue(
        new Error("Repository error"),
      );

      // Assertions
      await expect(requestService.getAllRequests()).rejects.toThrow();
      expect(mockRequestRepository.getAllRequests).toHaveBeenCalled();
    });

    it("should handle non-Error rejections from repository", async () => {
      // Mock repository rejecting with a string (not an Error object)
      mockRequestRepository.getAllRequests.mockRejectedValue(
        "Some string error",
      );

      // Assertions
      await expect(requestService.getAllRequests()).rejects.toThrow(
        "Failed to get requests",
      );
      expect(mockRequestRepository.getAllRequests).toHaveBeenCalled();
    });

    it("should handle undefined rejections from repository", async () => {
      // Mock repository rejecting with undefined
      mockRequestRepository.getAllRequests.mockRejectedValue(undefined);

      // Assertions
      await expect(requestService.getAllRequests()).rejects.toThrow(
        "Failed to get requests: Unknown error",
      );
      expect(mockRequestRepository.getAllRequests).toHaveBeenCalled();
    });
  });
});
