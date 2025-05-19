import {
  MonthlyDataRecord,
  PlanReportFilterOptions,
  ResultReportFilterOptions,
  SummaryReportFilterOptions,
} from "../interfaces/report.interface";
import ReportRepository from "../repository/report.repository";
import { getJakartaTime } from "../utils/date.utils";
import { PaginationOptions } from "../interfaces/pagination.interface";

class ReportService {
  private readonly reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  public async getMonthlyRequestCounts(): Promise<{
    success: boolean;
    data: MonthlyDataRecord[];
  }> {
    const rawData = await this.reportRepository.getMonthlyRequestCounts();
    const result = this.ensureLast12Months(rawData);

    return {
      success: true,
      data: result,
    };
  }

  public async getPlanReports(
    filters?: PlanReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { plans, total } = await this.reportRepository.getPlanReports(
      filters,
      pagination,
    );

    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    return {
      data: plans,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? plans.length,
        totalPages,
      },
    };
  }

  public async getResultReports(
    filters?: ResultReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { results, total } = await this.reportRepository.getResultReports(
      filters,
      pagination,
    );

    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    return {
      data: results,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? results.length,
        totalPages,
      },
    };
  }

  public async getSummaryReports(
    filters?: SummaryReportFilterOptions,
    pagination?: PaginationOptions,
  ) {
    const { comments, total } = await this.reportRepository.getSummaryReports(
      filters,
      pagination,
    );

    const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

    return {
      data: comments,
      meta: {
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? comments.length,
        totalPages,
      },
    };
  }

  public async getMaintenanceCount(): Promise<{
    success: boolean;
    count: number;
  }> {
    const count = await this.reportRepository.getMaintenanceCount();

    return {
      success: true,
      count,
    };
  }

  private ensureLast12Months(
    rawData: MonthlyDataRecord[],
  ): MonthlyDataRecord[] {
    if (!Array.isArray(rawData)) {
      throw new Error(
        "Data input tidak valid: harap berikan array data bulanan",
      );
    }

    const currentDate = getJakartaTime();
    const monthsData: Record<string, MonthlyDataRecord> = {};

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      monthsData[yearMonth] = {
        month: yearMonth,
        MAINTENANCE: 0,
        CALIBRATION: 0,
      };
    }

    // Update data dengan nilai dari data asli
    for (const item of rawData) {
      if (monthsData[item.month]) {
        // Handle maintenance count - explicitly handle null/undefined cases
        if (item.MAINTENANCE !== null && item.MAINTENANCE !== undefined) {
          monthsData[item.month].MAINTENANCE = item.MAINTENANCE;
        } else {
          monthsData[item.month].MAINTENANCE = 0;
        }

        // Handle calibration count - explicitly handle null/undefined cases
        if (item.CALIBRATION !== null && item.CALIBRATION !== undefined) {
          monthsData[item.month].CALIBRATION = item.CALIBRATION;
        } else {
          monthsData[item.month].CALIBRATION = 0;
        }
      }
    }

    // Convert kembali ke array dan diurutkan berdasarkan bulan (newest first)
    return Object.values(monthsData).sort((a, b) =>
      b.month.localeCompare(a.month),
    );
  }
}

export default ReportService;
