import { Request, Response } from "express";
import RequestService from "../services/request.service";
import AppError from "../utils/appError";

export class RequestController {
  private readonly requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

  getRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Request ID is required",
        });
        return;
      }

      const request = await this.requestService.getRequestById(id);

      res.status(200).json({
        success: true,
        message: "Request retrieved successfully",
        data: request,
      });
    } catch (error) {
      console.error("Error in get request by ID controller:", error);

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get request",
      });
    }
  };

  getAllRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const requests = await this.requestService.getAllRequests();

      res.status(200).json({
        success: true,
        message: "Requests retrieved successfully",
        data: requests,
      });
    } catch (error) {
      console.error("Error in get all requests controller:", error);

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get requests",
      });
    }
  };
}

export default RequestController;
