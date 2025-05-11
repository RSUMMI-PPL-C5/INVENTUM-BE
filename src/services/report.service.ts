import { MonthlyDataRecord } from "../interfaces/report.interface";
import ReportRepository from "../repository/report.repository";
import { getJakartaTime } from "../utils/date.utils";

class ReportService {
  private readonly reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  public async getMonthlyRequestCounts() {
    const rawData = await this.reportRepository.getMonthlyRequestCounts();
    const result = this.ensureLast12Months(rawData);

    return {
      success: true,
      data: result,
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
}

export default ReportService;
