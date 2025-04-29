import { Request, Response, NextFunction } from "express";
import RequestService from "../services/request.service";
import { CreateRequestDTO } from "../dto/request.dto";

class RequestController {
  private readonly requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

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
