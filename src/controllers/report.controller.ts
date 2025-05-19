import { Request, Response, NextFunction } from "express";
import ReportService from "../services/report.service";
import { PaginationOptions } from "../interfaces/pagination.interface";
import {
  PlanReportFilterOptions,
  ResultReportFilterOptions,
  SummaryReportFilterOptions,
} from "../interfaces/report.interface";

export class ReportController {
  private readonly reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  public getMonthlyRequestCounts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.reportService.getMonthlyRequestCounts();

      res.status(200).json({
        success: true,
        message: "Monthly request counts retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get plan reports (maintenance and calibration plans)
  public getPlanReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Extract query parameters
      const search = req.query.search as string;
      const rawStatus = req.query.status as string;
      const rawType = req.query.type as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Validate status parameter
      const validStatusValues = ["all", "scheduled", "pending"];
      const status = validStatusValues.includes(rawStatus)
        ? (rawStatus as PlanReportFilterOptions["status"])
        : undefined;

      // Validate type parameter
      const validTypeValues = ["all", "MAINTENANCE", "CALIBRATION"];
      const type = validTypeValues.includes(rawType)
        ? (rawType as PlanReportFilterOptions["type"])
        : undefined;

      // Pagination parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const filters: PlanReportFilterOptions = {
        search,
        status, // Use validated value instead of rawStatus
        type, // Use validated value instead of rawType
        startDate,
        endDate,
      };

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const result = await this.reportService.getPlanReports(
        filters,
        paginationOptions,
      );

      res.status(200).json({
        success: true,
        message: "Plan reports retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get result reports (maintenance, calibration, and parts replacement results)
  public getResultReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Extract query parameters
      const search = req.query.search as string;
      const rawResult = req.query.result as string;
      const rawType = req.query.type as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Validate result parameter
      const validResultValues = [
        "all",
        "success",
        "success-with-notes",
        "failed-with-notes",
      ];
      const result = validResultValues.includes(rawResult)
        ? (rawResult as ResultReportFilterOptions["result"])
        : undefined;

      // Validate type parameter
      const validTypeValues = ["all", "MAINTENANCE", "CALIBRATION", "PARTS"];
      const type = validTypeValues.includes(rawType)
        ? (rawType as ResultReportFilterOptions["type"])
        : undefined;

      // Pagination parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const filters: ResultReportFilterOptions = {
        search,
        result, // Use validated value instead of rawResult
        type, // Use validated value instead of rawType
        startDate,
        endDate,
      };

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const resultData = await this.reportService.getResultReports(
        filters,
        paginationOptions,
      );

      res.status(200).json({
        success: true,
        message: "Result reports retrieved successfully",
        ...resultData,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get summary reports (comments/responses)
  public getSummaryReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Extract query parameters
      const search = req.query.search as string;
      const rawType = req.query.type as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Validate type parameter
      const validTypeValues = ["all", "MAINTENANCE", "CALIBRATION"];
      const type = validTypeValues.includes(rawType)
        ? (rawType as SummaryReportFilterOptions["type"])
        : undefined;

      // Pagination parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      const filters: SummaryReportFilterOptions = {
        search,
        type, // Use validated value instead of rawType
        startDate,
        endDate,
      };

      const paginationOptions: PaginationOptions = {
        page: page > 0 ? page : 1,
        limit: limit > 0 ? limit : 10,
      };

      const result = await this.reportService.getSummaryReports(
        filters,
        paginationOptions,
      );

      res.status(200).json({
        success: true,
        message: "Summary reports retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getRequestStatusReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.reportService.getRequestStatusReport();

      res.status(200).json({
        success: true,
        message: "Request status report retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  public exportAllData = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const buffer = await this.reportService.exportAllData(
        new Date(startDate as string),
        new Date(endDate as string),
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=inventum-report.xlsx",
      );

      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  };

  public getCountReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.reportService.getCountReport();

      res.status(200).json({
        success: true,
        message: "Summary count report retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ReportController;
