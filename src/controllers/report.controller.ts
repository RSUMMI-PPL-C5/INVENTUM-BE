import { Request, Response, NextFunction } from "express";
import ReportService from "../services/report.service";

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
}

export default ReportController;
