import { v4 as uuidv4 } from "uuid";
import RequestService from "../../../../src/services/request.service";
import RequestRepository from "../../../../src/repository/request.repository";
import UserRepository from "../../../../src/repository/user.repository";
import WhatsAppService from "../../../../src/services/whatsapp.service";
import { CreateRequestDTO } from "../../../../src/dto/request.dto";
import { RequestType } from "@prisma/client";

jest.mock("../../../../src/repository/request.repository");
jest.mock("../../../../src/repository/user.repository");
jest.mock("../../../../src/services/whatsapp.service");
jest.mock("uuid");

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

    requestService = new RequestService();
    (requestService as any).requestRepository = mockRequestRepository;
    (requestService as any).userRepository = mockUserRepository;
    (requestService as any).whatsappService = mockWhatsappService;

    // Default mock for uuid
    (uuidv4 as jest.Mock).mockReturnValue("generated-uuid");
  });

  describe("createRequest", () => {
    const mockFasumUsers = [
      { waNumber: "08123456789" },
      { waNumber: "08198765432" },
      { waNumber: null }, // User without WhatsApp number
    ];

    it("should create a maintenance request successfully and send WhatsApp notifications", async () => {
      const mockRequestData: CreateRequestDTO = {
        userId: "user-123",
        medicalEquipment: "Test Equipment",
        complaint: "Test complaint",
        createdBy: "user-123",
        requestType: RequestType.MAINTENANCE,
      };

      const mockCreatedRequest = {
        id: "generated-uuid",
        ...mockRequestData,
        status: "Pending",
        createdOn: new Date(),
      };

      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);
      mockUserRepository.getUsersByRole.mockResolvedValue(mockFasumUsers);
      mockWhatsappService.sendMessage.mockResolvedValue();

      const result = await requestService.createRequest(mockRequestData);

      // Verify request creation
      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: "generated-uuid",
        ...mockRequestData,
      });

      // Verify Fasum users were fetched
      expect(mockUserRepository.getUsersByRole).toHaveBeenCalledWith("Fasum");

      // Verify WhatsApp notifications were sent
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledTimes(2);
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledWith(
        "08123456789",
        expect.stringContaining(mockRequestData.medicalEquipment),
      );
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledWith(
        "08198765432",
        expect.stringContaining(mockRequestData.medicalEquipment),
      );

      expect(result).toEqual({
        data: mockCreatedRequest,
      });
    });

    it("should create a calibration request successfully and send WhatsApp notifications", async () => {
      const mockRequestData: CreateRequestDTO = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment needs calibration",
        createdBy: "USER123",
        requestType: "CALIBRATION",
      };

      const mockCreatedRequest = {
        id: "generated-uuid",
        ...mockRequestData,
        status: "Pending",
        createdOn: new Date(),
      };

      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);
      mockUserRepository.getUsersByRole.mockResolvedValue(mockFasumUsers);
      mockWhatsappService.sendMessage.mockResolvedValue();

      const result = await requestService.createRequest(mockRequestData);

      // Verify request creation
      expect(mockRequestRepository.createRequest).toHaveBeenCalledWith({
        id: "generated-uuid",
        ...mockRequestData,
      });

      // Verify Fasum users were fetched
      expect(mockUserRepository.getUsersByRole).toHaveBeenCalledWith("Fasum");

      // Verify WhatsApp notifications were sent
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledTimes(2);
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledWith(
        "08123456789",
        expect.stringContaining(mockRequestData.medicalEquipment),
      );
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledWith(
        "08198765432",
        expect.stringContaining(mockRequestData.medicalEquipment),
      );

      expect(result).toEqual({
        data: mockCreatedRequest,
      });
    });

    it("should create request successfully even if WhatsApp notifications fail", async () => {
      const mockRequestData: CreateRequestDTO = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const mockCreatedRequest = {
        id: "generated-uuid",
        ...mockRequestData,
        status: "Pending",
        createdOn: new Date(),
      };

      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);
      mockUserRepository.getUsersByRole.mockResolvedValue(mockFasumUsers);
      mockWhatsappService.sendMessage.mockRejectedValue(
        new Error("WhatsApp API error"),
      );

      const result = await requestService.createRequest(mockRequestData);

      // Verify request was still created
      expect(mockRequestRepository.createRequest).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockCreatedRequest,
      });
    });

    it("should create request successfully when no Fasum users exist", async () => {
      const mockRequestData: CreateRequestDTO = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const mockCreatedRequest = {
        id: "generated-uuid",
        ...mockRequestData,
        status: "Pending",
        createdOn: new Date(),
      };

      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);
      mockUserRepository.getUsersByRole.mockResolvedValue([]);

      const result = await requestService.createRequest(mockRequestData);

      // Verify request was created
      expect(mockRequestRepository.createRequest).toHaveBeenCalled();
      // Verify no WhatsApp notifications were attempted
      expect(mockWhatsappService.sendMessage).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: mockCreatedRequest,
      });
    });

    it("should create request successfully when Fasum users have no WhatsApp numbers", async () => {
      const mockRequestData: CreateRequestDTO = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const mockCreatedRequest = {
        id: "generated-uuid",
        ...mockRequestData,
        status: "Pending",
        createdOn: new Date(),
      };

      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);
      mockUserRepository.getUsersByRole.mockResolvedValue([
        { waNumber: null },
        { waNumber: null },
      ]);

      const result = await requestService.createRequest(mockRequestData);

      // Verify request was created
      expect(mockRequestRepository.createRequest).toHaveBeenCalled();
      // Verify no WhatsApp notifications were attempted
      expect(mockWhatsappService.sendMessage).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: mockCreatedRequest,
      });
    });

    it("should handle partial WhatsApp notification failures", async () => {
      const mockRequestData: CreateRequestDTO = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
      };

      const mockCreatedRequest = {
        id: "generated-uuid",
        ...mockRequestData,
        status: "Pending",
        createdOn: new Date(),
      };

      mockRequestRepository.createRequest.mockResolvedValue(mockCreatedRequest);
      mockUserRepository.getUsersByRole.mockResolvedValue(mockFasumUsers);
      // First notification succeeds, second fails
      mockWhatsappService.sendMessage
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error("WhatsApp API error"));

      const result = await requestService.createRequest(mockRequestData);

      // Verify request was created
      expect(mockRequestRepository.createRequest).toHaveBeenCalled();
      // Verify both notifications were attempted
      expect(mockWhatsappService.sendMessage).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        data: mockCreatedRequest,
      });
    });

    it("should throw an error if creation fails", async () => {
      const mockRequestData: CreateRequestDTO = {
        userId: "USER123",
        medicalEquipment: "EQ123",
        complaint: "Equipment not working properly",
        createdBy: "USER123",
        requestType: "MAINTENANCE",
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
