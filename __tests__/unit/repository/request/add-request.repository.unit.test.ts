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

// Mock getJakartaTime
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("RequestRepository", () => {
  let requestRepository: RequestRepository;
  let mockDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();
    requestRepository = new RequestRepository();
    // Mock the Jakarta time
    mockDate = new Date();
    (getJakartaTime as jest.Mock).mockReturnValue(mockDate);
  });

  describe("createRequest", () => {
    it("should create a maintenance request successfully", async () => {
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        submissionDate: new Date(),
        status: "Pending",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const expectedResponse = {
        ...requestData,
        createdOn: mockDate,
        modifiedOn: mockDate,
      };

      (mockPrisma.create as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await requestRepository.createRequest(requestData);

      expect(mockPrisma.create).toHaveBeenCalledWith({
        data: {
          ...requestData,
          createdOn: mockDate,
          modifiedOn: mockDate,
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it("should create a calibration request successfully", async () => {
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment needs calibration",
        submissionDate: new Date(),
        status: "Pending",
        createdBy: "USER123",
        requestType: "CALIBRATION",
      };

      const expectedResponse = {
        ...requestData,
        createdOn: mockDate,
        modifiedOn: mockDate,
      };

      (mockPrisma.create as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await requestRepository.createRequest(requestData);

      expect(mockPrisma.create).toHaveBeenCalledWith({
        data: {
          ...requestData,
          createdOn: mockDate,
          modifiedOn: mockDate,
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if request creation fails", async () => {
      const requestData = {
        id: "REQ123",
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        submissionDate: new Date(),
        status: "Pending",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const errorMessage = "Request creation failed";
      (mockPrisma.create as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        requestRepository.createRequest(requestData),
      ).rejects.toThrow(errorMessage);
      expect(mockPrisma.create).toHaveBeenCalledTimes(1);
    });
  });
});
