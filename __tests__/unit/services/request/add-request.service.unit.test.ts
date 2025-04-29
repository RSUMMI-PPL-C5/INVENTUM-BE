import { v4 as uuidv4 } from "uuid";
import RequestService from "../../../../src/services/request.service";
import RequestRepository from "../../../../src/repository/request.repository";

jest.mock("../../../../src/repository/request.repository");
jest.mock("uuid");

describe("RequestService", () => {
  let requestService: RequestService;
  let mockRequestRepository: jest.Mocked<RequestRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestRepository =
      new RequestRepository() as jest.Mocked<RequestRepository>;
    requestService = new RequestService();
    (requestService as any).requestRepository = mockRequestRepository;

    // Default mock for uuid
    (uuidv4 as jest.Mock).mockReturnValue("generated-uuid");
  });

  describe("createRequest", () => {
    it("should create a maintenance request successfully", async () => {
      const mockRequestData = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        submissionDate: new Date(),
        createdBy: "USER123",
        requestType: "MAINTENANCE" as const,
      };

      const mockCreatedRequest = {
        id: "generated-uuid",
        ...mockRequestData,
        status: "Pending",
        createdOn: new Date(),
      };

      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);

      const result = await requestService.createRequest(mockRequestData);

      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        ...mockRequestData,
        id: "generated-uuid",
        status: "Pending",
      });
      expect(result).toEqual(mockCreatedRequest);
    });

    it("should create a calibration request successfully", async () => {
      const mockRequestData = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment needs calibration",
        submissionDate: new Date(),
        createdBy: "USER123",
        requestType: "CALIBRATION" as const,
      };

      const mockCreatedRequest = {
        id: "generated-uuid",
        ...mockRequestData,
        status: "Pending",
        createdOn: new Date(),
      };

      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);

      const result = await requestService.createRequest(mockRequestData);

      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        ...mockRequestData,
        id: "generated-uuid",
        status: "Pending",
      });
      expect(result).toEqual(mockCreatedRequest);
    });

    it("should throw an error if creation fails", async () => {
      const mockRequestData = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        submissionDate: new Date(),
        createdBy: "USER123",
        requestType: "MAINTENANCE" as const,
      };

      mockRequestRepository.createRequest.mockRejectedValue(
        new Error("Failed to create request"),
      );

      await expect(
        requestService.createRequest(mockRequestData),
      ).rejects.toThrow("Failed to create request");
    });
  });
});
