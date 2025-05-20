import RequestRepository from "../../../../src/repository/request.repository";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockCreate = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      request: {
        create: mockCreate,
      },
    })),
    __mockPrisma: {
      create: mockCreate,
    },
  };
});

// Mock configs/db.config
jest.mock("../../../../src/configs/db.config", () => {
  const mockCreate = jest.fn();

  return {
    __esModule: true,
    default: {
      request: {
        create: mockCreate,
      },
    },
  };
});

// Mock getJakartaTime
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

// Get access to the mocked Prisma functions
const mockDb = jest.requireMock("../../../../src/configs/db.config").default;

describe("RequestRepository", () => {
  let requestRepository: RequestRepository;
  let mockDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();
    requestRepository = new RequestRepository();
    // Mock the Jakarta time
    mockDate = new Date("2023-05-01T12:00:00Z");
    (getJakartaTime as jest.Mock).mockReturnValue(mockDate);
  });

  describe("createRequest", () => {
    it("should create a maintenance request successfully", async () => {
      // Arrange
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "MRI Machine",
        complaint: "Equipment not working properly",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const mockUserData = {
        id: "USER123",
        fullname: "John Doe",
        username: "johndoe",
      };

      const expectedResponse = {
        ...requestData,
        status: "pending",
        createdOn: mockDate,
        modifiedOn: mockDate,
        user: mockUserData,
      };

      mockDb.request.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await requestRepository.createRequest(requestData);

      // Assert
      expect(mockDb.request.create).toHaveBeenCalledWith({
        data: {
          ...requestData,
          status: "pending",
          createdOn: mockDate,
          modifiedOn: mockDate,
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it("should create a calibration request successfully", async () => {
      // Arrange
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "Ultrasound Machine",
        complaint: "Equipment needs calibration",
        createdBy: "USER123",
        requestType: "CALIBRATION",
      };

      const mockUserData = {
        id: "USER123",
        fullname: "John Doe",
        username: "johndoe",
      };

      const expectedResponse = {
        ...requestData,
        status: "pending",
        createdOn: mockDate,
        modifiedOn: mockDate,
        user: mockUserData,
      };

      mockDb.request.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await requestRepository.createRequest(requestData);

      // Assert
      expect(mockDb.request.create).toHaveBeenCalledWith({
        data: {
          ...requestData,
          status: "pending",
          createdOn: mockDate,
          modifiedOn: mockDate,
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it("should set status to 'pending' even if another status is provided", async () => {
      // Arrange
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "X-Ray Machine",
        complaint: "Equipment needs maintenance",
        status: "Completed",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const expectedResponse = {
        ...requestData,
        status: "pending",
        createdOn: mockDate,
        modifiedOn: mockDate,
      };

      mockDb.request.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await requestRepository.createRequest(requestData);

      // Assert
      expect(mockDb.request.create).toHaveBeenCalledWith({
        data: {
          ...requestData,
          status: "pending",
          createdOn: mockDate,
          modifiedOn: mockDate,
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if request creation fails", async () => {
      // Arrange
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "CT Scanner",
        complaint: "Equipment not working properly",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const errorMessage = "Request creation failed";
      mockDb.request.create.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        requestRepository.createRequest(requestData),
      ).rejects.toThrow(errorMessage);
      expect(mockDb.request.create).toHaveBeenCalledTimes(1);
    });

    it("should handle request creation with additional fields", async () => {
      // Arrange
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "EKG Machine",
        complaint: "Equipment not calibrated",
        createdBy: "USER123",
        requestType: "CALIBRATION",
        additionalNotes: "High priority",
        departmentId: "DEPT123",
      };

      const expectedResponse = {
        ...requestData,
        status: "pending",
        createdOn: mockDate,
        modifiedOn: mockDate,
      };

      mockDb.request.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await requestRepository.createRequest(requestData);

      // Assert
      expect(mockDb.request.create).toHaveBeenCalledWith({
        data: {
          ...requestData,
          status: "pending",
          createdOn: mockDate,
          modifiedOn: mockDate,
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it("should handle non-Error rejection types", async () => {
      // Arrange
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "Ventilator",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const errorString = "Database connection error";
      mockDb.request.create.mockRejectedValue(errorString);

      // Act & Assert
      await expect(requestRepository.createRequest(requestData)).rejects.toBe(
        errorString,
      );
      expect(mockDb.request.create).toHaveBeenCalledTimes(1);
    });
  });
});
