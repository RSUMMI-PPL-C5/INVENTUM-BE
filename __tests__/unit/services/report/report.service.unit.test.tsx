import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";

// Mock the repository
jest.mock("../../../../src/repository/report.repository", () => {
  return jest.fn().mockImplementation(() => ({
    getMonthlyRequestCounts: jest.fn(),
    getPlanReports: jest.fn(),
    getResultReports: jest.fn(),
    getSummaryReports: jest.fn(),
  }));
});

// Mock date utils if used in the service
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(() => new Date("2023-06-15")),
}));

describe("ReportService", () => {
  let reportService: ReportService;
  let reportRepository: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    reportService = new ReportService();
    reportRepository = new (ReportRepository as any)();
    (reportService as any).reportRepository = reportRepository;
  });

  describe("getMonthlyRequestCounts", () => {
    it("should return monthly request counts with data filled for 12 months", async () => {
      const mockRawData = [
        { month: "2023-01", MAINTENANCE: 5, CALIBRATION: 3 },
        { month: "2023-03", MAINTENANCE: 10, CALIBRATION: 7 },
      ];

      reportRepository.getMonthlyRequestCounts.mockResolvedValue(mockRawData);

      const result = await reportService.getMonthlyRequestCounts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(12);
      expect(result.data.find((d) => d.month === "2023-01")?.MAINTENANCE).toBe(
        5,
      );
      expect(result.data.find((d) => d.month === "2023-01")?.CALIBRATION).toBe(
        3,
      );
      expect(result.data.find((d) => d.month === "2023-03")?.MAINTENANCE).toBe(
        10,
      );
      expect(result.data.find((d) => d.month === "2023-02")?.MAINTENANCE).toBe(
        0,
      );
    });

    it("should handle empty data", async () => {
      reportRepository.getMonthlyRequestCounts.mockResolvedValue([]);

      const result = await reportService.getMonthlyRequestCounts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(12);
      result.data.forEach((item) => {
        expect(item.MAINTENANCE).toBe(0);
        expect(item.CALIBRATION).toBe(0);
      });
    });

    it("should throw error for null data", async () => {
      reportRepository.getMonthlyRequestCounts.mockResolvedValue(null as any);

      await expect(reportService.getMonthlyRequestCounts()).rejects.toThrow(
        "Data input tidak valid: harap berikan array data bulanan",
      );
    });

    it("should throw error for invalid data format", async () => {
      reportRepository.getMonthlyRequestCounts.mockResolvedValue(
        "not an array" as any,
      );

      await expect(reportService.getMonthlyRequestCounts()).rejects.toThrow(
        "Data input tidak valid: harap berikan array data bulanan",
      );
    });
  });

  describe("getPlanReports", () => {
    it("should return plan reports with pagination", async () => {
      const mockPlans = [{ id: "1" }, { id: "2" }];
      const mockTotal = 10;
      const mockPagination = { page: 2, limit: 2 };

      reportRepository.getPlanReports.mockResolvedValue({
        plans: mockPlans,
        total: mockTotal,
      });

      const result = await reportService.getPlanReports({}, mockPagination);

      expect(result.data).toBe(mockPlans);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(5); // 10/2 = 5
    });

    it("should return plan reports without pagination", async () => {
      const mockPlans = [{ id: "1" }, { id: "2" }];
      const mockTotal = 2;

      reportRepository.getPlanReports.mockResolvedValue({
        plans: mockPlans,
        total: mockTotal,
      });

      const result = await reportService.getPlanReports();

      expect(result.data).toBe(mockPlans);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("getResultReports", () => {
    it("should return result reports with pagination", async () => {
      const mockResults = [{ id: "1" }, { id: "2" }];
      const mockTotal = 10;
      const mockPagination = { page: 2, limit: 2 };

      reportRepository.getResultReports.mockResolvedValue({
        results: mockResults,
        total: mockTotal,
      });

      const result = await reportService.getResultReports({}, mockPagination);

      expect(result.data).toBe(mockResults);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(5);
    });

    it("should return result reports without pagination", async () => {
      const mockResults = [{ id: "1" }, { id: "2" }];
      const mockTotal = 2;

      reportRepository.getResultReports.mockResolvedValue({
        results: mockResults,
        total: mockTotal,
      });

      const result = await reportService.getResultReports();

      expect(result.data).toBe(mockResults);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("getSummaryReports", () => {
    it("should return summary reports with pagination", async () => {
      const mockComments = [{ id: "1" }, { id: "2" }];
      const mockTotal = 10;
      const mockPagination = { page: 2, limit: 2 };

      reportRepository.getSummaryReports.mockResolvedValue({
        comments: mockComments,
        total: mockTotal,
      });

      const result = await reportService.getSummaryReports({}, mockPagination);

      expect(result.data).toBe(mockComments);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(5);
    });

    it("should return summary reports without pagination", async () => {
      const mockComments = [{ id: "1" }, { id: "2" }];
      const mockTotal = 2;

      reportRepository.getSummaryReports.mockResolvedValue({
        comments: mockComments,
        total: mockTotal,
      });

      const result = await reportService.getSummaryReports();

      expect(result.data).toBe(mockComments);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("exportPlanReportsToCSV", () => {
    it("should export plan reports to CSV format", async () => {
      const mockPlans = [
        {
          id: "1",
          medicalEquipment: "Equip1",
          requestType: "Maintenance",
          status: "Pending",
          createdOn: new Date("2023-01-01"),
          user: { fullname: "User1" },
        },
      ];

      reportRepository.getPlanReports.mockResolvedValue({
        plans: mockPlans,
        total: 1,
      });

      jest
        .spyOn(reportService as any, "generateCSV")
        .mockReturnValue("CSV content");
      jest
        .spyOn(reportService as any, "formatDate")
        .mockReturnValue("01/01/2023");

      const result = await reportService.exportPlanReportsToCSV();

      expect(result).toBe("CSV content");
      expect((reportService as any).generateCSV).toHaveBeenCalledWith(
        [
          "ID",
          "ID Peralatan",
          "Tipe",
          "Status",
          "Tanggal Dibuat",
          "Dibuat Oleh",
        ],
        [["1", "Equip1", "Maintenance", "Pending", "01/01/2023", "User1"]],
      );
    });

    it("should handle empty or null fields", async () => {
      const mockPlans = [
        {
          id: "1",
          medicalEquipment: null,
          requestType: null,
          status: null,
          createdOn: new Date("2023-01-01"),
          user: null,
        },
      ];

      reportRepository.getPlanReports.mockResolvedValue({
        plans: mockPlans,
        total: 1,
      });

      jest
        .spyOn(reportService as any, "generateCSV")
        .mockReturnValue("CSV content");
      jest
        .spyOn(reportService as any, "formatDate")
        .mockReturnValue("01/01/2023");

      const result = await reportService.exportPlanReportsToCSV();

      expect(result).toBe("CSV content");
      expect((reportService as any).generateCSV).toHaveBeenCalled();
    });
  });

  describe("exportResultReportsToCSV", () => {
    it("should export result reports to CSV format", async () => {
      const mockResults = [
        {
          id: "1",
          medicalEquipmentId: "Equip1",
          medicalEquipment: { name: "Equipment 1", inventorisId: "INV001" },
          type: "MAINTENANCE",
          result: "Success",
          technician: "Tech1",
          actionPerformed: "Action",
          maintenanceDate: new Date("2023-01-01"),
          createdBy: "User1",
          createdOn: new Date("2023-01-01"),
        },
      ];

      reportRepository.getResultReports.mockResolvedValue({
        results: mockResults,
        total: 1,
      });

      jest
        .spyOn(reportService as any, "generateCSV")
        .mockReturnValue("CSV content");
      jest
        .spyOn(reportService as any, "formatDate")
        .mockReturnValue("01/01/2023");

      const result = await reportService.exportResultReportsToCSV();

      expect(result).toBe("CSV content");
      expect((reportService as any).generateCSV).toHaveBeenCalled();
    });

    it("should handle calibration results", async () => {
      const mockResults = [
        {
          id: "1",
          medicalEquipmentId: "Equip1",
          medicalEquipment: { name: "Equipment 1", inventorisId: "INV001" },
          type: "CALIBRATION",
          result: "Success",
          technician: "Tech1",
          actionPerformed: "Calibrated",
          calibrationDate: new Date("2023-01-01"),
          createdBy: "User1",
          createdOn: new Date("2023-01-01"),
        },
      ];

      reportRepository.getResultReports.mockResolvedValue({
        results: mockResults,
        total: 1,
      });

      jest
        .spyOn(reportService as any, "generateCSV")
        .mockReturnValue("CSV content");
      jest
        .spyOn(reportService as any, "formatDate")
        .mockReturnValue("01/01/2023");

      const result = await reportService.exportResultReportsToCSV();

      expect(result).toBe("CSV content");
      expect((reportService as any).generateCSV).toHaveBeenCalled();
    });

    it("should handle parts replacement results", async () => {
      const mockResults = [
        {
          id: "1",
          medicalEquipmentId: "Equip1",
          medicalEquipment: { name: "Equipment 1", inventorisId: "INV001" },
          type: "PARTS",
          sparepart: { partsName: "Spare Part 1" },
          result: "Success",
          technician: "Tech1",
          actionPerformed: "Replaced parts",
          replacementDate: new Date("2023-01-01"),
          createdBy: "User1",
          createdOn: new Date("2023-01-01"),
        },
      ];

      reportRepository.getResultReports.mockResolvedValue({
        results: mockResults,
        total: 1,
      });

      jest
        .spyOn(reportService as any, "generateCSV")
        .mockReturnValue("CSV content");
      jest
        .spyOn(reportService as any, "formatDate")
        .mockReturnValue("01/01/2023");

      const result = await reportService.exportResultReportsToCSV();

      expect(result).toBe("CSV content");
      expect((reportService as any).generateCSV).toHaveBeenCalled();
    });

    it("should handle null or undefined values", async () => {
      const mockResults = [{ id: "1" }];

      reportRepository.getResultReports.mockResolvedValue({
        results: mockResults,
        total: 1,
      });

      jest
        .spyOn(reportService as any, "generateCSV")
        .mockReturnValue("CSV content");
      jest.spyOn(reportService as any, "formatDate").mockReturnValue("");

      const result = await reportService.exportResultReportsToCSV();

      expect(result).toBe("CSV content");
    });
  });

  describe("exportSummaryReportsToCSV", () => {
    it("should export summary reports to CSV format", async () => {
      const mockComments = [
        {
          id: "1",
          requestId: "req1",
          request: { requestType: "MAINTENANCE" },
          text: "Comment text",
          createdAt: new Date("2023-01-01"),
          user: { fullname: "User1" },
        },
      ];

      reportRepository.getSummaryReports.mockResolvedValue({
        comments: mockComments,
        total: 1,
      });

      jest
        .spyOn(reportService as any, "generateCSV")
        .mockReturnValue("CSV content");
      jest
        .spyOn(reportService as any, "formatDate")
        .mockReturnValue("01/01/2023");

      const result = await reportService.exportSummaryReportsToCSV();

      expect(result).toBe("CSV content");
      expect((reportService as any).generateCSV).toHaveBeenCalledWith(
        [
          "ID",
          "ID Permintaan",
          "Tipe Permintaan",
          "Tanggapan",
          "Tanggal",
          "Ditulis Oleh",
        ],
        [["1", "req1", "MAINTENANCE", "Comment text", "01/01/2023", "User1"]],
      );
    });

    it("should handle empty or null fields", async () => {
      const mockComments = [
        {
          id: "1",
          requestId: null,
          request: null,
          text: null,
          createdAt: new Date("2023-01-01"),
          user: null,
        },
      ];

      reportRepository.getSummaryReports.mockResolvedValue({
        comments: mockComments,
        total: 1,
      });

      jest
        .spyOn(reportService as any, "generateCSV")
        .mockReturnValue("CSV content");
      jest
        .spyOn(reportService as any, "formatDate")
        .mockReturnValue("01/01/2023");

      const result = await reportService.exportSummaryReportsToCSV();

      expect(result).toBe("CSV content");
      expect((reportService as any).generateCSV).toHaveBeenCalled();
    });
  });

  describe("Private methods", () => {
    describe("formatDate", () => {
      it("should format date correctly", () => {
        const date = new Date("2023-01-15T12:00:00Z");
        const result = (reportService as any).formatDate(date);
        expect(result).toBe("15/01/2023");
      });

      it("should handle null or undefined dates", () => {
        expect((reportService as any).formatDate(null)).toBe("");
        expect((reportService as any).formatDate(undefined)).toBe("");
      });

      it("should handle numeric values", () => {
        expect((reportService as any).formatDate(12345)).toBe("");
      });

      it("should handle invalid date objects", () => {
        expect((reportService as any).formatDate(new Date("invalid"))).toBe("");
      });

      it("should handle other data types", () => {
        expect((reportService as any).formatDate({})).toBe("");
        expect((reportService as any).formatDate([])).toBe("");
        // Boolean true is converted to timestamp 1, which is 01/01/1970
        expect((reportService as any).formatDate(true)).toBe("01/01/1970");
      });

      it("should handle objects that throw exceptions during date operations", () => {
        // Create an object that throws an error when accessed in Date operations
        const errorObj = {
          valueOf: () => {
            throw new Error("Test error");
          },
          toString: () => {
            throw new Error("Test error");
          },
        };

        // This should trigger the catch block
        const result = (reportService as any).formatDate(errorObj);

        expect(result).toBe("");
      });
    });

    describe("generateCSV", () => {
      it("should generate CSV content from headers and rows", () => {
        const headers = ["Header1", "Header2"];
        const rows = [
          ["Value1", "Value2"],
          ["Value3", "Value4"],
        ];

        const result = (reportService as any).generateCSV(headers, rows);

        expect(result).toBe("Header1,Header2\nValue1,Value2\nValue3,Value4");
      });

      it("should handle empty rows", () => {
        const headers = ["Header1", "Header2"];
        const rows: any[][] = [];

        const result = (reportService as any).generateCSV(headers, rows);

        expect(result).toBe("Header1,Header2");
      });

      it("should escape values with special characters", () => {
        const headers = ["Header1", "Header2"];
        const rows = [
          ["Value with, comma", 'Value with "quotes"'],
          ["Value\nwith\nnewline", "Normal"],
        ];

        const result = (reportService as any).generateCSV(headers, rows);

        expect(result).toContain('"Value with, comma"');
        expect(result).toContain('"Value with ""quotes"""');
        expect(result).toContain('"Value\nwith\nnewline"');
      });
    });

    describe("ensureLast12Months", () => {
      it("should ensure data for last 12 months is present", () => {
        const mockRawData = [
          { month: "2023-01", MAINTENANCE: 5, CALIBRATION: 3 },
          { month: "2023-03", MAINTENANCE: 10, CALIBRATION: 7 },
        ];

        const result = (reportService as any).ensureLast12Months(mockRawData);

        expect(result).toHaveLength(12);
        expect(result.find((d: any) => d.month === "2023-01").MAINTENANCE).toBe(
          5,
        );
        expect(result.find((d: any) => d.month === "2023-01").CALIBRATION).toBe(
          3,
        );
        expect(result.find((d: any) => d.month === "2023-03").MAINTENANCE).toBe(
          10,
        );
        expect(result.find((d: any) => d.month === "2023-02").MAINTENANCE).toBe(
          0,
        );
      });

      it("should throw error for non-array input", () => {
        expect(() =>
          (reportService as any).ensureLast12Months("not an array"),
        ).toThrow("Data input tidak valid: harap berikan array data bulanan");
      });

      it("should throw error for null input", () => {
        expect(() => (reportService as any).ensureLast12Months(null)).toThrow(
          "Data input tidak valid: harap berikan array data bulanan",
        );
      });
    });
  });
});
