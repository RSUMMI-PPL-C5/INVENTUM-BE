import RequestRepository from "../../../../src/repository/request.repository";
import { getJakartaTime } from "../../../../src/utils/date.utils";

// Mock the database config
jest.mock("../../../../src/configs/db.config", () => {
  const mockUpdate = jest.fn();

  return {
    __esModule: true,
    default: {
      request: {
        update: mockUpdate,
      },
    },
  };
});

// Mock getJakartaTime
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

// Get access to the mocked functions
const mockDb = jest.requireMock("../../../../src/configs/db.config").default;

describe("RequestRepository - updateRequestStatus", () => {
  let requestRepository: RequestRepository;
  let mockDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();
    requestRepository = new RequestRepository();
    // Mock the current date/time
    mockDate = new Date("2023-05-01T12:00:00Z");
    (getJakartaTime as jest.Mock).mockReturnValue(mockDate);
  });

  // Positive cases
  it("should successfully update request status to Completed", async () => {
    // Arrange
    const requestId = "req-123";
    const newStatus = "Completed";

    const mockUpdatedRequest = {
      id: requestId,
      status: newStatus,
      modifiedOn: mockDate,
      medicalEquipment: "MRI Machine",
      requestType: "MAINTENANCE",
    };

    mockDb.request.update.mockResolvedValue(mockUpdatedRequest);

    // Act
    const result = await requestRepository.updateRequestStatus(
      requestId,
      newStatus,
    );

    // Assert
    expect(mockDb.request.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: {
        status: newStatus,
        modifiedOn: mockDate,
      },
    });
    expect(result).toEqual(mockUpdatedRequest);
  });

  it("should successfully update request status to In Progress", async () => {
    // Arrange
    const requestId = "req-456";
    const newStatus = "In Progress";

    const mockUpdatedRequest = {
      id: requestId,
      status: newStatus,
      modifiedOn: mockDate,
      medicalEquipment: "X-Ray Machine",
      requestType: "CALIBRATION",
    };

    mockDb.request.update.mockResolvedValue(mockUpdatedRequest);

    // Act
    const result = await requestRepository.updateRequestStatus(
      requestId,
      newStatus,
    );

    // Assert
    expect(mockDb.request.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: {
        status: newStatus,
        modifiedOn: mockDate,
      },
    });
    expect(result).toEqual(mockUpdatedRequest);
  });

  // Negative cases
  it("should throw error when request with ID is not found", async () => {
    // Arrange
    const requestId = "non-existent-id";
    const newStatus = "Completed";

    const mockError = new Error(`Record to update not found.`);
    mockDb.request.update.mockRejectedValue(mockError);

    // Act & Assert
    await expect(
      requestRepository.updateRequestStatus(requestId, newStatus),
    ).rejects.toThrow(mockError);

    expect(mockDb.request.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: {
        status: newStatus,
        modifiedOn: mockDate,
      },
    });
  });

  it("should throw error when database operation fails", async () => {
    // Arrange
    const requestId = "req-789";
    const newStatus = "Rejected";

    const mockError = new Error("Database connection failed");
    mockDb.request.update.mockRejectedValue(mockError);

    // Act & Assert
    await expect(
      requestRepository.updateRequestStatus(requestId, newStatus),
    ).rejects.toThrow(mockError);

    expect(mockDb.request.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: {
        status: newStatus,
        modifiedOn: mockDate,
      },
    });
  });

  // Edge cases
  it("should handle empty status string", async () => {
    // Arrange
    const requestId = "req-123";
    const newStatus = "";

    const mockUpdatedRequest = {
      id: requestId,
      status: newStatus, // Empty status
      modifiedOn: mockDate,
    };

    mockDb.request.update.mockResolvedValue(mockUpdatedRequest);

    // Act
    const result = await requestRepository.updateRequestStatus(
      requestId,
      newStatus,
    );

    // Assert
    expect(mockDb.request.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: {
        status: newStatus,
        modifiedOn: mockDate,
      },
    });
    expect(result).toEqual(mockUpdatedRequest);
  });

  it("should handle very long status string", async () => {
    // Arrange
    const requestId = "req-123";
    const newStatus = "A".repeat(500); // Very long status string

    const mockUpdatedRequest = {
      id: requestId,
      status: newStatus,
      modifiedOn: mockDate,
    };

    mockDb.request.update.mockResolvedValue(mockUpdatedRequest);

    // Act
    const result = await requestRepository.updateRequestStatus(
      requestId,
      newStatus,
    );

    // Assert
    expect(mockDb.request.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: {
        status: newStatus,
        modifiedOn: mockDate,
      },
    });
    expect(result).toEqual(mockUpdatedRequest);
  });

  it("should handle updating request with special characters in ID", async () => {
    // Arrange
    const requestId = "req-123#@!";
    const newStatus = "Completed";

    const mockUpdatedRequest = {
      id: requestId,
      status: newStatus,
      modifiedOn: mockDate,
    };

    mockDb.request.update.mockResolvedValue(mockUpdatedRequest);

    // Act
    const result = await requestRepository.updateRequestStatus(
      requestId,
      newStatus,
    );

    // Assert
    expect(mockDb.request.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: {
        status: newStatus,
        modifiedOn: mockDate,
      },
    });
    expect(result).toEqual(mockUpdatedRequest);
  });

  it("should update to case-sensitive status values", async () => {
    // Arrange
    const requestId = "req-123";
    const newStatus = "IN PROGRESS"; // All caps version

    const mockUpdatedRequest = {
      id: requestId,
      status: newStatus,
      modifiedOn: mockDate,
    };

    mockDb.request.update.mockResolvedValue(mockUpdatedRequest);

    // Act
    const result = await requestRepository.updateRequestStatus(
      requestId,
      newStatus,
    );

    // Assert
    expect(mockDb.request.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: {
        status: newStatus,
        modifiedOn: mockDate,
      },
    });
    expect(result).toEqual(mockUpdatedRequest);
  });
});
