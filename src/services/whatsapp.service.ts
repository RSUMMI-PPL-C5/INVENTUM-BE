import AppError from "../utils/appError";

class WhatsAppService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || "";
    this.apiKey = process.env.WHATSAPP_API_KEY || "";

    if (!this.apiUrl || !this.apiKey) {
      throw new Error("WhatsApp API configuration is missing");
    }
  }

  public async sendMessage(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    try {
      // Format phone number to ensure it's in the correct format (e.g., 628xxxxxxxxxx)

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw new AppError("Failed to send WhatsApp notification", 500);
    }
  }
}

export default WhatsAppService;
