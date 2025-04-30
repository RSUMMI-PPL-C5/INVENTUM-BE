import { Request, Response, NextFunction } from "express";
import RequestService from "../services/request.service";
import AppError from "../utils/appError";
import { CreateRequestDTO } from "../dto/request.dto";

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

  // Add this to your request.controller.ts file

  getAllRequestMaintenance = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const maintenanceRequests =
        await this.requestService.getAllRequestMaintenance();

      res.status(200).json({
        success: true,
        message: "Maintenance requests retrieved successfully",
        data: maintenanceRequests,
      });
    } catch (error) {
      console.error("Error in get maintenance requests controller:", error);

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
          error instanceof Error
            ? error.message
            : "Failed to get maintenance requests",
      });
    }
  };

  getAllRequestCalibration = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const calibrationRequests =
        await this.requestService.getAllRequestCalibration();

      res.status(200).json({
        success: true,
        message: "Calibration requests retrieved successfully",
        data: calibrationRequests,
      });
    } catch (error) {
      console.error("Error in get calibration requests controller:", error);

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
          error instanceof Error
            ? error.message
            : "Failed to get calibration requests",
      });
    }
  };

  public createMaintenanceRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req.user as any).userId;

      const requestData: CreateRequestDTO = {
        ...req.body,
        userId,
        createdBy: userId,
        requestType: "MAINTENANCE",
      };

      const result = await this.requestService.createRequest(requestData);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public createCalibrationRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req.user as any).userId;

      const requestData: CreateRequestDTO = {
        ...req.body,
        userId,
        createdBy: userId,
        requestType: "CALIBRATION",
      };

      const result = await this.requestService.createRequest(requestData);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default RequestController;
