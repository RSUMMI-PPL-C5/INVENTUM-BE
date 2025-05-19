import ReportService from "../../../../src/services/report.service";
import ReportRepository from "../../../../src/repository/report.repository";
import ExcelJS from "exceljs";
import { RequestType } from "@prisma/client";

jest.mock("../../../../src/repository/report.repository");
jest.mock("exceljs");

describe("ReportService - exportAllData", () => {
  let service: ReportService;
  let mockReportRepository: jest.Mocked<ReportRepository>;
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-12-31");

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportRepository =
      new ReportRepository() as jest.Mocked<ReportRepository>;
    (ReportRepository as jest.Mock).mockImplementation(
      () => mockReportRepository,
    );
    service = new ReportService();
  });

  it("should successfully export all data to Excel", async () => {
    const mockData = {
      users: [
        {
          id: "user1",
          email: "test@example.com",
          username: "testuser",
          password: "hashedpassword",
          role: "admin",
          fullname: "Test User",
          nokar: "12345",
          divisiId: 1,
          waNumber: "08123456789",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      divisions: [
        {
          id: 1,
          divisi: "IT",
          parentId: null,
          createdOn: new Date(),
          modifiedOn: new Date(),
        },
      ],
      equipment: [
        {
          id: "equip1",
          inventorisId: "INV001",
          name: "MRI",
          brandName: "Siemens",
          modelName: "MAGNETOM",
          purchaseDate: new Date(),
          purchasePrice: 1000000,
          status: "Active",
          vendor: "Siemens Healthcare",
          lastLocation: "Room 101",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      spareparts: [
        {
          id: "part1",
          partsName: "Bolt",
          purchaseDate: new Date(),
          price: 100000,
          toolLocation: "Storage A",
          toolDate: "2024-01-01",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      partsHistory: [
        {
          id: "hist1",
          medicalEquipmentId: "equip1",
          sparepartId: "part1",
          actionPerformed: "Replacement",
          technician: "John Doe",
          result: "Success",
          replacementDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
        },
      ],
      requests: [
        {
          id: "req1",
          userId: "user1",
          medicalEquipment: "MRI",
          complaint: "Not working",
          status: "Pending",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          requestType: RequestType.MAINTENANCE,
        },
      ],
      maintenanceHistory: [
        {
          id: "maint1",
          medicalEquipmentId: "equip1",
          actionPerformed: "Regular maintenance",
          technician: "John Doe",
          result: "Success",
          maintenanceDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
        },
      ],
      calibrationHistory: [
        {
          id: "cal1",
          medicalEquipmentId: "equip1",
          actionPerformed: "Annual calibration",
          technician: "John Doe",
          result: "Success",
          calibrationDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
          calibrationMethod: "Standard calibration procedure",
          nextCalibrationDue: new Date("2025-01-01"),
        },
      ],
      notifications: [
        {
          id: "notif1",
          requestId: "req1",
          userId: "user1",
          message: "New request",
          isRead: false,
          createdOn: new Date(),
        },
      ],
      comments: [
        {
          id: "comment1",
          requestId: "req1",
          userId: "user1",
          text: "Test comment",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    const mockWorkbook = {
      creator: "",
      created: new Date(),
      addWorksheet: jest.fn().mockReturnValue({
        addRow: jest.fn(),
        columns: [],
      }),
      xlsx: {
        writeBuffer: jest
          .fn()
          .mockResolvedValue(Buffer.from("mock excel data")),
      },
    };

    (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
    mockReportRepository.getAllData.mockResolvedValue(mockData);

    const result = await service.exportAllData(startDate, endDate);

    expect(mockReportRepository.getAllData).toHaveBeenCalledWith(
      startDate,
      endDate,
    );
    expect(ExcelJS.Workbook).toHaveBeenCalled();
    expect(mockWorkbook.addWorksheet).toHaveBeenCalledTimes(10); // One for each model
    expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Buffer);
  });

  it("should throw error when end date is before start date", async () => {
    const invalidStartDate = new Date("2024-12-31");
    const invalidEndDate = new Date("2024-01-01");

    await expect(
      service.exportAllData(invalidStartDate, invalidEndDate),
    ).rejects.toThrow("End date must be after start date");
  });

  it("should throw error when repository fails", async () => {
    const dbError = new Error("Database connection failed");
    mockReportRepository.getAllData.mockRejectedValue(dbError);

    await expect(service.exportAllData(startDate, endDate)).rejects.toThrow(
      "Database connection failed",
    );
  });

  it("should handle empty data from repository", async () => {
    const emptyData = {
      users: [],
      divisions: [],
      equipment: [],
      spareparts: [],
      partsHistory: [],
      requests: [],
      maintenanceHistory: [],
      calibrationHistory: [],
      notifications: [],
      comments: [],
    };

    const mockWorkbook = {
      creator: "",
      created: new Date(),
      addWorksheet: jest.fn().mockReturnValue({
        addRow: jest.fn(),
        columns: [],
      }),
      xlsx: {
        writeBuffer: jest
          .fn()
          .mockResolvedValue(Buffer.from("mock excel data")),
      },
    };

    (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
    mockReportRepository.getAllData.mockResolvedValue(emptyData);

    const result = await service.exportAllData(startDate, endDate);

    expect(mockReportRepository.getAllData).toHaveBeenCalledWith(
      startDate,
      endDate,
    );
    expect(ExcelJS.Workbook).toHaveBeenCalled();
    expect(mockWorkbook.addWorksheet).toHaveBeenCalledTimes(10); // Should still create all sheets
    expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Buffer);
  });

  it("should throw error when Excel generation fails", async () => {
    const mockData = {
      users: [
        {
          id: "user1",
          email: "test@example.com",
          username: "testuser",
          password: "hashedpassword",
          role: "admin",
          fullname: "Test User",
          nokar: "12345",
          divisiId: 1,
          waNumber: "08123456789",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      divisions: [
        {
          id: 1,
          divisi: "IT",
          parentId: null,
          createdOn: new Date(),
          modifiedOn: new Date(),
        },
      ],
      equipment: [
        {
          id: "equip1",
          inventorisId: "INV001",
          name: "MRI",
          brandName: "Siemens",
          modelName: "MAGNETOM",
          purchaseDate: new Date(),
          purchasePrice: 1000000,
          status: "Active",
          vendor: "Siemens Healthcare",
          lastLocation: "Room 101",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      spareparts: [
        {
          id: "part1",
          partsName: "Bolt",
          purchaseDate: new Date(),
          price: 100000,
          toolLocation: "Storage A",
          toolDate: "2024-01-01",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      partsHistory: [
        {
          id: "hist1",
          medicalEquipmentId: "equip1",
          sparepartId: "part1",
          actionPerformed: "Replacement",
          technician: "John Doe",
          result: "Success",
          replacementDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
        },
      ],
      requests: [
        {
          id: "req1",
          userId: "user1",
          medicalEquipment: "MRI",
          complaint: "Not working",
          status: "Pending",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          requestType: RequestType.MAINTENANCE,
        },
      ],
      maintenanceHistory: [
        {
          id: "maint1",
          medicalEquipmentId: "equip1",
          actionPerformed: "Regular maintenance",
          technician: "John Doe",
          result: "Success",
          maintenanceDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
        },
      ],
      calibrationHistory: [
        {
          id: "cal1",
          medicalEquipmentId: "equip1",
          actionPerformed: "Annual calibration",
          technician: "John Doe",
          result: "Success",
          calibrationDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
          calibrationMethod: "Standard calibration procedure",
          nextCalibrationDue: new Date("2025-01-01"),
        },
      ],
      notifications: [
        {
          id: "notif1",
          requestId: "req1",
          userId: "user1",
          message: "New request",
          isRead: false,
          createdOn: new Date(),
        },
      ],
      comments: [
        {
          id: "comment1",
          requestId: "req1",
          userId: "user1",
          text: "Test comment",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    const mockWorkbook = {
      creator: "",
      created: new Date(),
      addWorksheet: jest.fn().mockReturnValue({
        addRow: jest.fn(),
        columns: [],
      }),
      xlsx: {
        writeBuffer: jest
          .fn()
          .mockRejectedValue(new Error("Excel generation failed")),
      },
    };

    (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
    mockReportRepository.getAllData.mockResolvedValue(mockData);

    await expect(service.exportAllData(startDate, endDate)).rejects.toThrow(
      "Excel generation failed",
    );
  });

  it("should handle same start and end date", async () => {
    const sameDate = new Date("2024-01-01");
    const mockData = {
      users: [
        {
          id: "user1",
          email: "test@example.com",
          username: "testuser",
          password: "hashedpassword",
          role: "admin",
          fullname: "Test User",
          nokar: "12345",
          divisiId: 1,
          waNumber: "08123456789",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      divisions: [
        {
          id: 1,
          divisi: "IT",
          parentId: null,
          createdOn: new Date(),
          modifiedOn: new Date(),
        },
      ],
      equipment: [
        {
          id: "equip1",
          inventorisId: "INV001",
          name: "MRI",
          brandName: "Siemens",
          modelName: "MAGNETOM",
          purchaseDate: new Date(),
          purchasePrice: 1000000,
          status: "Active",
          vendor: "Siemens Healthcare",
          lastLocation: "Room 101",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      spareparts: [
        {
          id: "part1",
          partsName: "Bolt",
          purchaseDate: new Date(),
          price: 100000,
          toolLocation: "Storage A",
          toolDate: "2024-01-01",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          deletedBy: null,
          deletedOn: null,
        },
      ],
      partsHistory: [
        {
          id: "hist1",
          medicalEquipmentId: "equip1",
          sparepartId: "part1",
          actionPerformed: "Replacement",
          technician: "John Doe",
          result: "Success",
          replacementDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
        },
      ],
      requests: [
        {
          id: "req1",
          userId: "user1",
          medicalEquipment: "MRI",
          complaint: "Not working",
          status: "Pending",
          createdBy: "system",
          createdOn: new Date(),
          modifiedBy: null,
          modifiedOn: new Date(),
          requestType: RequestType.MAINTENANCE,
        },
      ],
      maintenanceHistory: [
        {
          id: "maint1",
          medicalEquipmentId: "equip1",
          actionPerformed: "Regular maintenance",
          technician: "John Doe",
          result: "Success",
          maintenanceDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
        },
      ],
      calibrationHistory: [
        {
          id: "cal1",
          medicalEquipmentId: "equip1",
          actionPerformed: "Annual calibration",
          technician: "John Doe",
          result: "Success",
          calibrationDate: new Date(),
          createdBy: "system",
          createdOn: new Date(),
          calibrationMethod: "Standard calibration procedure",
          nextCalibrationDue: new Date("2025-01-01"),
        },
      ],
      notifications: [
        {
          id: "notif1",
          requestId: "req1",
          userId: "user1",
          message: "New request",
          isRead: false,
          createdOn: new Date(),
        },
      ],
      comments: [
        {
          id: "comment1",
          requestId: "req1",
          userId: "user1",
          text: "Test comment",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    const mockWorkbook = {
      creator: "",
      created: new Date(),
      addWorksheet: jest.fn().mockReturnValue({
        addRow: jest.fn(),
        columns: [],
      }),
      xlsx: {
        writeBuffer: jest
          .fn()
          .mockResolvedValue(Buffer.from("mock excel data")),
      },
    };

    (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
    mockReportRepository.getAllData.mockResolvedValue(mockData);

    const result = await service.exportAllData(sameDate, sameDate);

    expect(mockReportRepository.getAllData).toHaveBeenCalledWith(
      sameDate,
      sameDate,
    );
    expect(ExcelJS.Workbook).toHaveBeenCalled();
    expect(mockWorkbook.addWorksheet).toHaveBeenCalledTimes(10);
    expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Buffer);
  });
});
