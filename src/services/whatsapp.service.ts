import AppError from "../utils/appError";

class WhatsAppService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || "";
    this.apiKey = process.env.WHATSAPP_API_KEY || "";
  }

  public async sendMessage(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    try {
      if (!this.apiUrl || !this.apiKey) {
        return;
      }

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
