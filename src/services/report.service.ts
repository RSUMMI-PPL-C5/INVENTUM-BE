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

  // Get plan reports (maintenance and calibration plans)
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

  // Get result reports (maintenance, calibration, and parts replacement results)
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

  // Get summary reports (comments/responses)
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

  // Export plan reports to CSV
  public async exportPlanReportsToCSV(
    filters?: PlanReportFilterOptions,
  ): Promise<string> {
    // Get all data without pagination
    const { plans } = await this.reportRepository.getPlanReports(filters);

    // Define CSV headers
    const headers = [
      "ID",
      "ID Peralatan",
      "Tipe",
      "Status",
      "Tanggal Dibuat",
      "Dibuat Oleh",
    ];

    // Convert data to CSV rows
    const rows = plans.map((plan) => [
      plan.id,
      plan.medicalEquipment || "", // This is just the ID string, not an object
      plan.requestType || "",
      plan.status || "",
      this.formatDate(plan.createdOn),
      plan.user?.fullname || "",
    ]);

    // Generate CSV content
    return this.generateCSV(headers, rows);
  }

  // Export result reports to CSV
  public async exportResultReportsToCSV(
    filters?: ResultReportFilterOptions,
  ): Promise<string> {
    // Get all data without pagination
    const { results } = await this.reportRepository.getResultReports(filters);

    // Define CSV headers
    const headers = [
      "ID",
      "ID Peralatan",
      "Nama Peralatan",
      "No. Inventaris",
      "Tipe",
      "Hasil",
      "Teknisi",
      "Tindakan",
      "Tanggal",
      "Dibuat Oleh",
      "Tanggal Dibuat",
    ];

    // Convert data to CSV rows
    const rows = results.map((result) => {
      // Get the date based on result type
      let date = "";
      if (result?.type === "MAINTENANCE") {
        date = this.formatDate(result.maintenanceDate);
      } else if (result?.type === "CALIBRATION") {
        date = this.formatDate(result.calibrationDate);
      } else if (result?.type === "PARTS") {
        date = this.formatDate(result.replacementDate);
      } else {
        // For unknown types, explicitly call formatDate with undefined
        date = this.formatDate(undefined);
      }

      // For PARTS type, add spare part info
      let sparePartInfo = "";
      if (result?.type === "PARTS" && result.sparepart) {
        sparePartInfo = `(${result.sparepart.partsName || "Spare Part"})`;
      }

      return [
        result?.id || "",
        result?.medicalEquipmentId || "",
        result?.medicalEquipment?.name || "",
        result?.medicalEquipment?.inventorisId || "",
        `${result?.type || ""} ${sparePartInfo}`.trim(),
        result?.result || "",
        result?.technician || "",
        result?.actionPerformed || "",
        date,
        result?.createdBy || "",
        this.formatDate(result?.createdOn),
      ];
    });

    // Generate CSV content
    return this.generateCSV(headers, rows);
  }

  // Export summary reports to CSV
  public async exportSummaryReportsToCSV(
    filters?: SummaryReportFilterOptions,
  ): Promise<string> {
    // Get all data without pagination
    const { comments } = await this.reportRepository.getSummaryReports(filters);

    // Define CSV headers
    const headers = [
      "ID",
      "ID Permintaan",
      "Tipe Permintaan",
      "Tanggapan",
      "Tanggal",
      "Ditulis Oleh",
    ];

    // Convert data to CSV rows
    const rows = comments.map((comment) => [
      comment.id,
      comment.requestId || "",
      comment.request?.requestType || "",
      comment.text || "",
      this.formatDate(comment.createdAt),
      comment.user?.fullname || "",
    ]);

    // Generate CSV content
    return this.generateCSV(headers, rows);
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

    // Inisialisasi data untuk 12 bulan terakhir dengan nol
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
    rawData.forEach((item) => {
      if (monthsData[item.month]) {
        monthsData[item.month].MAINTENANCE = item.MAINTENANCE ?? 0;
        monthsData[item.month].CALIBRATION = item.CALIBRATION ?? 0;
      }
    });

    // Convert kembali ke array dan diurutkan berdasarkan bulan (newest first)
    return Object.values(monthsData).sort((a, b) =>
      b.month.localeCompare(a.month),
    );
  }

  // Helper function to generate CSV content
  private generateCSV(headers: string[], rows: any[][]): string {
    const headerRow = headers.join(",");
    const dataRows = rows.map((row) =>
      row
        .map((cell) => {
          // Handle cells that need quoting (contain commas, quotes, or newlines)
          const cellStr = String(cell || "");
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(","),
    );

    // Always return a non-empty string even if there are no rows
    return dataRows.length > 0
      ? [headerRow, ...dataRows].join("\n")
      : headerRow;
  }

  // Helper function to format dates
  private formatDate(date: any): string {
    if (!date) return "";

    // Handle numeric inputs as invalid
    if (typeof date === "number") return "";

    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return ""; // Handle invalid dates
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch (e) {
      // Return empty string for any errors (e.g., when passing empty objects, arrays, etc.)
      return "";
    }
  }
}

export default ReportService;
