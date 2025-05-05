import { Request, Response, NextFunction } from "express";
import RequestService from "../services/request.service";
import { CreateRequestDTO } from "../dto/request.dto";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { RequestFilterOptions } from "../interfaces/request.filter.interface";

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

      const result = await this.requestService.getRequestById(id);

      res.status(200).json({
        success: true,
        message: "Request retrieved successfully",
        data: result.data,
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
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const filters: RequestFilterOptions = req.query as any;
      const search = req.query.search as string | undefined;

      const result = await this.requestService.getAllRequests(
        search,
        filters,
        paginationOptions,
      );

      res.status(200).json(result);
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
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const filters: RequestFilterOptions = req.query as any;
      const search = req.query.search as string | undefined;

      const result = await this.requestService.getAllRequestMaintenance(
        search,
        filters,
        paginationOptions,
      );

      res.status(200).json(result);
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
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const filters: RequestFilterOptions = req.query as any;
      const search = req.query.search as string | undefined;

      const result = await this.requestService.getAllRequestCalibration(
        search,
        filters,
        paginationOptions,
      );

      res.status(200).json(result);
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
        data: result.data,
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
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateRequestStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: "Status is required in request body",
        });
        return;
      }

      const result = await this.requestService.updateRequestStatus(id, status);

      res.status(200).json({
        success: true,
        message: "Request status updated successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default RequestController;
