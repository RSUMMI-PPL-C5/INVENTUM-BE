import WhatsAppService from "../../../../src/services/whatsapp.service";
import AppError from "../../../../src/utils/appError";

// Mock fetch
global.fetch = jest.fn();

describe("WhatsAppService", () => {
  let whatsappService: WhatsAppService;
  const mockApiUrl = "https://api.whatsapp.com/v1/messages";
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    // Reset environment variables
    process.env.WHATSAPP_API_URL = mockApiUrl;
    process.env.WHATSAPP_API_KEY = mockApiKey;

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();

    whatsappService = new WhatsAppService();
  });

  describe("constructor", () => {
    it("should throw error if API configuration is missing", () => {
      // Remove environment variables
      delete process.env.WHATSAPP_API_URL;
      delete process.env.WHATSAPP_API_KEY;

      expect(() => new WhatsAppService()).toThrow(
        "WhatsApp API configuration is missing",
      );
    });

    it("should initialize successfully with valid configuration", () => {
      expect(() => new WhatsAppService()).not.toThrow();
    });
  });

  describe("sendMessage", () => {
    const mockPhoneNumber = "08123456789";
    const mockMessage = "Test message";

    it("should send message successfully", async () => {
      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await expect(
        whatsappService.sendMessage(mockPhoneNumber, mockMessage),
      ).resolves.not.toThrow();

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(mockApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "628123456789", // Formatted number
          message: mockMessage,
        }),
      });
    });

    it("should throw AppError when API request fails", async () => {
      // Mock failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        whatsappService.sendMessage(mockPhoneNumber, mockMessage),
      ).rejects.toThrow(AppError);
    });

    it("should throw AppError when fetch throws an error", async () => {
      // Mock fetch throwing an error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(
        whatsappService.sendMessage(mockPhoneNumber, mockMessage),
      ).rejects.toThrow(AppError);
    });

    it("should throw AppError with correct message when fetch throws an error", async () => {
      // Mock fetch throwing an error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(
        whatsappService.sendMessage(mockPhoneNumber, mockMessage),
      ).rejects.toThrow(
        new AppError("Failed to send WhatsApp notification", 500),
      );
    });
  });

  describe("formatPhoneNumber", () => {
    it("should format number starting with 0", () => {
      const result = (whatsappService as any).formatPhoneNumber("08123456789");
      expect(result).toBe("628123456789");
    });

    it("should keep number starting with 62", () => {
      const result = (whatsappService as any).formatPhoneNumber("628123456789");
      expect(result).toBe("628123456789");
    });

    it("should add 62 to number starting with 8", () => {
      const result = (whatsappService as any).formatPhoneNumber("8123456789");
      expect(result).toBe("628123456789");
    });

    it("should remove non-digit characters", () => {
      const result = (whatsappService as any).formatPhoneNumber(
        "0812-3456-789",
      );
      expect(result).toBe("628123456789");
    });
  });
});
