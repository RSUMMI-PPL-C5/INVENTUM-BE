import { Request, Response, NextFunction } from "express";
import RequestService from "../services/request.service";
import { CreateRequestDTO } from "../dto/request.dto";

export class RequestController {
  private readonly requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

  public getRequestById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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
      next(error);
    }
  };

  public getAllRequests = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const requests = await this.requestService.getAllRequests();

      res.status(200).json({
        success: true,
        message: "Requests retrieved successfully",
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllRequestMaintenance = async (
    req: Request,
    res: Response,
    next: NextFunction,
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
      next(error);
    }
  };

  public getAllRequestCalibration = async (
    req: Request,
    res: Response,
    next: NextFunction,
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
      next(error);
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
