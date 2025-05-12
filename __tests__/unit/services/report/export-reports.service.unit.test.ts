import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";

// Mock dependencies
jest.mock("../../../../src/repository/report.repository");

describe("ReportService - Export Reports", () => {
  let service: ReportService;
  let mockRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new ReportRepository() as jest.Mocked<ReportRepository>;
    service = new ReportService();
    (service as any).reportRepository = mockRepository;
  });

  describe("exportPlanReportsToCSV", () => {
    it("should generate CSV content from plan reports", async () => {
      // Arrange
      const mockPlans = [
        {
          id: "plan1",
          medicalEquipment: "med1",
          requestType: "MAINTENANCE",
          status: "SCHEDULED",
          createdOn: "2023-07-10",
          user: { fullname: "John Doe" },
        },
        {
          id: "plan2",
          medicalEquipment: "med2",
          requestType: "CALIBRATION",
          status: "COMPLETED",
          createdOn: "2023-07-15",
          user: { fullname: "Jane Smith" },
        },
      ];

      mockRepository.getPlanReports = jest.fn().mockResolvedValue({
        plans: mockPlans,
        total: 2,
      });

      // Mock formatDate and generateCSV
      jest
        .spyOn(service as any, "formatDate")
        .mockImplementation((...args: unknown[]) => {
          const date = args[0] as string;
          if (date === "2023-07-10") return "10/07/2023";
          if (date === "2023-07-15") return "15/07/2023";
          return "01/01/2023";
        });

      jest
        .spyOn(service as any, "generateCSV")
        .mockImplementation((...args: unknown[]) => {
          const headers = args[0] as string[];
          const rows = args[1] as string[][];
          return `${headers.join(",")}\n${rows.map((row) => row.join(",")).join("\n")}`;
        });

      // Act
      const result = await service.exportPlanReportsToCSV();

      // Assert
      expect(mockRepository.getPlanReports).toHaveBeenCalledWith(undefined);
      expect(result).toContain(
        "ID,ID Peralatan,Tipe,Status,Tanggal Dibuat,Dibuat Oleh",
      );
      expect(result).toContain(
        "plan1,med1,MAINTENANCE,SCHEDULED,10/07/2023,John Doe",
      );
      expect(result).toContain(
        "plan2,med2,CALIBRATION,COMPLETED,15/07/2023,Jane Smith",
      );
    });

    it("should handle filters", async () => {
      // Arrange
      mockRepository.getPlanReports = jest.fn().mockResolvedValue({
        plans: [],
        total: 0,
      });

      jest.spyOn(service as any, "generateCSV").mockReturnValue("");

      const filters = { type: "MAINTENANCE" as const };

      // Act
      await service.exportPlanReportsToCSV(filters);

      // Assert
      expect(mockRepository.getPlanReports).toHaveBeenCalledWith(filters);
    });
  });

  describe("exportSummaryReportsToCSV", () => {
    it("should generate CSV content from summary reports", async () => {
      // Arrange
      const mockComments = [
        {
          id: "comment1",
          requestId: "req1",
          request: { requestType: "MAINTENANCE" },
          text: "This is a comment",
          createdAt: "2023-08-05",
          user: { fullname: "John Doe" },
        },
        {
          id: "comment2",
          requestId: "req2",
          request: { requestType: "CALIBRATION" },
          text: "Another comment",
          createdAt: "2023-08-10",
          user: { fullname: "Jane Smith" },
        },
      ];

      mockRepository.getSummaryReports = jest.fn().mockResolvedValue({
        comments: mockComments,
        total: 2,
      });

      // Mock formatDate and generateCSV
      jest
        .spyOn(service as any, "formatDate")
        .mockImplementation((...args: unknown[]) => {
          const date = args[0] as string;
          if (date === "2023-08-05") return "05/08/2023";
          if (date === "2023-08-10") return "10/08/2023";
          return "01/01/2023";
        });

      jest
        .spyOn(service as any, "generateCSV")
        .mockImplementation((...args: unknown[]) => {
          const headers = args[0] as string[];
          const rows = args[1] as string[][];
          return `${headers.join(",")}\n${rows.map((row) => row.join(",")).join("\n")}`;
        });

      // Act
      const result = await service.exportSummaryReportsToCSV();

      // Assert
      expect(mockRepository.getSummaryReports).toHaveBeenCalledWith(undefined);
      expect(result).toContain(
        "ID,ID Permintaan,Tipe Permintaan,Tanggapan,Tanggal,Ditulis Oleh",
      );
      expect(result).toContain(
        "comment1,req1,MAINTENANCE,This is a comment,05/08/2023,John Doe",
      );
      expect(result).toContain(
        "comment2,req2,CALIBRATION,Another comment,10/08/2023,Jane Smith",
      );
    });

    it("should handle filters", async () => {
      // Arrange
      mockRepository.getSummaryReports = jest.fn().mockResolvedValue({
        comments: [],
        total: 0,
      });

      jest.spyOn(service as any, "generateCSV").mockReturnValue("");

      const filters = { search: "test" };

      // Act
      await service.exportSummaryReportsToCSV(filters);

      // Assert
      expect(mockRepository.getSummaryReports).toHaveBeenCalledWith(filters);
    });
  });
});
