import {
  MonthlyDataRecord,
  PlanReportFilterOptions,
  ResultReportFilterOptions,
  SummaryReportFilterOptions,
  RequestStatusReport,
  CountReport,
} from "../interfaces/report.interface";
import ReportRepository from "../repository/report.repository";
import { getJakartaTime } from "../utils/date.utils";
import ExcelJS from "exceljs";
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

  public async getRequestStatusReport(): Promise<{
    success: boolean;
    data: RequestStatusReport;
  }> {
    try {
      const reportData = await this.reportRepository.getRequestStatusReport();

      return {
        success: true,
        data: reportData,
      };
    } catch (error) {
      console.error("Error getting request status report:", error);
      throw error;
    }
  }

  public async exportAllData(startDate: Date, endDate: Date): Promise<Buffer> {
    try {
      // Validate date range
      if (endDate < startDate) {
        throw new Error("End date must be after start date");
      }

      // Get all data from repository
      const data = await this.reportRepository.getAllData(startDate, endDate);

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Inventum";
      workbook.created = new Date();

      // Add sheets for each model
      this.addUsersSheet(workbook, data.users);
      this.addDivisionsSheet(workbook, data.divisions);
      this.addEquipmentSheet(workbook, data.equipment);
      this.addSparepartsSheet(workbook, data.spareparts);
      this.addPartsHistorySheet(workbook, data.partsHistory);
      this.addRequestsSheet(workbook, data.requests);
      this.addMaintenanceHistorySheet(workbook, data.maintenanceHistory);
      this.addCalibrationHistorySheet(workbook, data.calibrationHistory);
      this.addNotificationsSheet(workbook, data.notifications);
      this.addCommentsSheet(workbook, data.comments);

      // Generate buffer
      return (await workbook.xlsx.writeBuffer()) as Buffer;
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }

  private addUsersSheet(workbook: ExcelJS.Workbook, users: any[]) {
    const sheet = workbook.addWorksheet("Users");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "Email", key: "email", width: 30 },
      { header: "Username", key: "username", width: 20 },
      { header: "Full Name", key: "fullname", width: 30 },
      { header: "Role", key: "role", width: 15 },
      { header: "No. Karyawan", key: "nokar", width: 15 },
      { header: "Division", key: "divisiId", width: 15 },
      { header: "WhatsApp", key: "waNumber", width: 15 },
      { header: "Created On", key: "createdOn", width: 20 },
      { header: "Modified On", key: "modifiedOn", width: 20 },
    ];

    users.forEach((user) => {
      sheet.addRow(user);
    });
  }

  private addDivisionsSheet(workbook: ExcelJS.Workbook, divisions: any[]) {
    const sheet = workbook.addWorksheet("Divisions");
    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Division Name", key: "divisi", width: 30 },
      { header: "Parent ID", key: "parentId", width: 10 },
    ];

    divisions.forEach((division) => {
      sheet.addRow(division);
    });
  }

  private addEquipmentSheet(workbook: ExcelJS.Workbook, equipment: any[]) {
    const sheet = workbook.addWorksheet("Medical Equipment");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "Inventory ID", key: "inventorisId", width: 20 },
      { header: "Name", key: "name", width: 30 },
      { header: "Brand", key: "brandName", width: 20 },
      { header: "Model", key: "modelName", width: 20 },
      { header: "Purchase Date", key: "purchaseDate", width: 20 },
      { header: "Purchase Price", key: "purchasePrice", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Vendor", key: "vendor", width: 20 },
      { header: "Created On", key: "createdOn", width: 20 },
      { header: "Modified On", key: "modifiedOn", width: 20 },
    ];

    equipment.forEach((item) => {
      sheet.addRow(item);
    });
  }

  private addSparepartsSheet(workbook: ExcelJS.Workbook, spareparts: any[]) {
    const sheet = workbook.addWorksheet("Spareparts");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "Parts Name", key: "partsName", width: 30 },
      { header: "Purchase Date", key: "purchaseDate", width: 20 },
      { header: "Price", key: "price", width: 15 },
      { header: "Location", key: "toolLocation", width: 20 },
      { header: "Tool Date", key: "toolDate", width: 20 },
      { header: "Created On", key: "createdOn", width: 20 },
      { header: "Modified On", key: "modifiedOn", width: 20 },
    ];

    spareparts.forEach((part) => {
      sheet.addRow(part);
    });
  }

  private addPartsHistorySheet(workbook: ExcelJS.Workbook, history: any[]) {
    const sheet = workbook.addWorksheet("Parts History");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "Equipment ID", key: "medicalEquipmentId", width: 40 },
      { header: "Sparepart ID", key: "sparepartId", width: 40 },
      { header: "Action", key: "actionPerformed", width: 40 },
      { header: "Technician", key: "technician", width: 20 },
      { header: "Result", key: "result", width: 15 },
      { header: "Replacement Date", key: "replacementDate", width: 20 },
      { header: "Created On", key: "createdOn", width: 20 },
    ];

    history.forEach((item) => {
      sheet.addRow(item);
    });
  }

  private addRequestsSheet(workbook: ExcelJS.Workbook, requests: any[]) {
    const sheet = workbook.addWorksheet("Requests");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "User ID", key: "userId", width: 40 },
      { header: "Equipment", key: "medicalEquipment", width: 30 },
      { header: "Complaint", key: "complaint", width: 40 },
      { header: "Status", key: "status", width: 15 },
      { header: "Type", key: "requestType", width: 15 },
      { header: "Created On", key: "createdOn", width: 20 },
      { header: "Modified On", key: "modifiedOn", width: 20 },
    ];

    requests.forEach((request) => {
      sheet.addRow(request);
    });
  }

  private addMaintenanceHistorySheet(
    workbook: ExcelJS.Workbook,
    history: any[],
  ) {
    const sheet = workbook.addWorksheet("Maintenance History");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "Equipment ID", key: "medicalEquipmentId", width: 40 },
      { header: "Action", key: "actionPerformed", width: 40 },
      { header: "Technician", key: "technician", width: 20 },
      { header: "Result", key: "result", width: 15 },
      { header: "Maintenance Date", key: "maintenanceDate", width: 20 },
      { header: "Created On", key: "createdOn", width: 20 },
    ];

    history.forEach((item) => {
      sheet.addRow(item);
    });
  }

  private addCalibrationHistorySheet(
    workbook: ExcelJS.Workbook,
    history: any[],
  ) {
    const sheet = workbook.addWorksheet("Calibration History");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "Equipment ID", key: "medicalEquipmentId", width: 40 },
      { header: "Action", key: "actionPerformed", width: 40 },
      { header: "Technician", key: "technician", width: 20 },
      { header: "Result", key: "result", width: 15 },
      { header: "Calibration Date", key: "calibrationDate", width: 20 },
      { header: "Method", key: "calibrationMethod", width: 20 },
      { header: "Next Due", key: "nextCalibrationDue", width: 20 },
      { header: "Created On", key: "createdOn", width: 20 },
    ];

    history.forEach((item) => {
      sheet.addRow(item);
    });
  }

  private addNotificationsSheet(
    workbook: ExcelJS.Workbook,
    notifications: any[],
  ) {
    const sheet = workbook.addWorksheet("Notifications");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "User ID", key: "userId", width: 40 },
      { header: "Request ID", key: "requestId", width: 40 },
      { header: "Message", key: "message", width: 40 },
      { header: "Read", key: "isRead", width: 10 },
      { header: "Created On", key: "createdOn", width: 20 },
    ];

    notifications.forEach((notification) => {
      sheet.addRow(notification);
    });
  }

  private addCommentsSheet(workbook: ExcelJS.Workbook, comments: any[]) {
    const sheet = workbook.addWorksheet("Comments");
    sheet.columns = [
      { header: "ID", key: "id", width: 40 },
      { header: "Text", key: "text", width: 40 },
      { header: "User ID", key: "userId", width: 40 },
      { header: "Request ID", key: "requestId", width: 40 },
      { header: "Created At", key: "createdAt", width: 20 },
      { header: "Modified At", key: "modifiedAt", width: 20 },
    ];

    comments.forEach((comment) => {
      sheet.addRow(comment);
    });
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

  public async getCountReport(): Promise<{
    success: boolean;
    data: CountReport;
  }> {
    try {
      const reportData = await this.reportRepository.getCountReport();

      return {
        success: true,
        data: reportData,
      };
    } catch (error) {
      console.error("Error getting count report:", error);
      throw error;
    }
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
