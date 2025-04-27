import RequestRepository from "../../../../src/repository/request.repository";
import AppError from "../../../../src/utils/appError";

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    request: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

jest.mock("../../../../src/configs/db.config", () => {
  return {
    __esModule: true,
    default: {
      request: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    },
  };
});

describe("RequestRepository", () => {
  let repository: RequestRepository;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new RequestRepository();
    mockPrisma = (repository as any).prisma;
  });

  describe("getRequestById", () => {
    it("should get a request by ID successfully", async () => {
      // Arrange
      const requestId = "request-123";
      const mockRequest = {
        id: requestId,
        userId: "user-123",
        medicalEquipment: "Equipment Name",
        submissionDate: new Date(),
        status: "Pending",
        user: { id: "user-123", fullname: "Test User", username: "testuser" },
        comments: [],
        notifications: [],
      };

      mockPrisma.request.findUnique.mockResolvedValue(mockRequest);

      // Act
      const result = await repository.getRequestById(requestId);

      // Assert
      expect(mockPrisma.request.findUnique).toHaveBeenCalledWith({
        where: { id: requestId },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockRequest);
    });

    it("should handle errors when fetching a request", async () => {
      // Arrange
      const requestId = "request-123";
      mockPrisma.request.findUnique.mockRejectedValue(
        new Error("Database error"),
      );

      // Act & Assert
      await expect(repository.getRequestById(requestId)).rejects.toThrow(
        AppError,
      );
      expect(mockPrisma.request.findUnique).toHaveBeenCalled();
    });
  });

  describe("getAllRequests", () => {
    it("should get all requests successfully", async () => {
      // Arrange
      const mockRequests = [
        {
          id: "request-1",
          userId: "user-1",
          medicalEquipment: "Equipment 1",
          submissionDate: new Date(),
          status: "Pending",
        },
        {
          id: "request-2",
          userId: "user-2",
          medicalEquipment: "Equipment 2",
          submissionDate: new Date(),
          status: "Completed",
        },
      ];

      mockPrisma.request.findMany.mockResolvedValue(mockRequests);

      // Act
      const result = await repository.getAllRequests();

      // Assert
      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockRequests);
    });

    it("should handle errors when fetching all requests", async () => {
      // Arrange
      mockPrisma.request.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      // Act & Assert
      await expect(repository.getAllRequests()).rejects.toThrow(AppError);
      expect(mockPrisma.request.findMany).toHaveBeenCalled();
    });
  });

  describe("getAllRequestMaintenance", () => {
    it("should get all maintenance requests successfully", async () => {
      // Arrange
      const mockRequests = [
        {
          id: "request-1",
          userId: "user-1",
          medicalEquipment: "Equipment 1",
          submissionDate: new Date(),
          status: "Pending",
          requestType: "MAINTENANCE",
        },
        {
          id: "request-2",
          userId: "user-2",
          medicalEquipment: "Equipment 2",
          submissionDate: new Date(),
          status: "Completed",
          requestType: "MAINTENANCE",
        },
      ];

      mockPrisma.request.findMany.mockResolvedValue(mockRequests);

      // Act
      const result = await repository.getAllRequestMaintenance();

      // Assert
      expect(mockPrisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            requestType: "MAINTENANCE",
          },
        }),
      );
      expect(result).toEqual(mockRequests);
    });

    it("should handle errors when fetching maintenance requests", async () => {
      // Arrange
      mockPrisma.request.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      // Act & Assert
      await expect(repository.getAllRequestMaintenance()).rejects.toThrow(
        AppError,
      );
      expect(mockPrisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            requestType: "MAINTENANCE",
          },
        }),
      );
    });
  });
});
