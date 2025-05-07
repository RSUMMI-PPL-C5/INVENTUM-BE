import RequestRepository from "../../../../src/repository/request.repository";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";
import { RequestFilterOptions } from "../../../../src/interfaces/request.filter.interface";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockFindUnique = jest.fn();
  const mockFindMany = jest.fn();
  const mockCount = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      request: {
        findUnique: mockFindUnique,
        findMany: mockFindMany,
        count: mockCount,
      },
    })),
    __mockPrisma: {
      findUnique: mockFindUnique,
      findMany: mockFindMany,
      count: mockCount,
    },
  };
});

// Mock configs/db.config
jest.mock("../../../../src/configs/db.config", () => {
  const mockFindUnique = jest.fn();
  const mockFindMany = jest.fn();
  const mockCount = jest.fn();

  return {
    __esModule: true,
    default: {
      request: {
        findUnique: mockFindUnique,
        findMany: mockFindMany,
        count: mockCount,
      },
    },
  };
});

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");
const mockDb = jest.requireMock("../../../../src/configs/db.config").default;

describe("RequestRepository - GET Methods", () => {
  let requestRepository: RequestRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    requestRepository = new RequestRepository();
  });

  describe("getRequestById", () => {
    it("should fetch a request by ID successfully", async () => {
      // Mock data
      const mockId = "request-123";
      const mockRequest = {
        id: mockId,
        medicalEquipment: "MRI Machine",
        complaint: "Not working properly",
        status: "Pending",
        user: { id: "user-123", fullname: "Test User", username: "testuser" },
        comments: [],
        notifications: [],
      };

      // Setup mock
      mockDb.request.findUnique.mockResolvedValue(mockRequest);

      // Execute repository method
      const result = await requestRepository.getRequestById(mockId);

      // Check the mock was called correctly
      expect(mockDb.request.findUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          notifications: true,
        },
      });

      // Check result
      expect(result).toEqual(mockRequest);
    });

    it("should return null when request is not found", async () => {
      // Mock data
      const mockId = "non-existent-id";

      // Setup mock
      mockDb.request.findUnique.mockResolvedValue(null);

      // Execute repository method
      const result = await requestRepository.getRequestById(mockId);

      // Check the mock was called correctly
      expect(mockDb.request.findUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: expect.any(Object),
      });

      // Check result
      expect(result).toBeNull();
    });
  });

  describe("getAllRequests", () => {
    it("should fetch all requests without filters or pagination", async () => {
      // Mock data
      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "CT Scanner",
          complaint: "Calibration needed",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
          comments: [],
          notifications: [],
        },
        {
          id: "request-2",
          medicalEquipment: "X-Ray Machine",
          complaint: "Not working",
          status: "Completed",
          user: { id: "user-2", fullname: "User Two", username: "usertwo" },
          comments: [],
          notifications: [],
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequests();

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });
      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: {},
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should apply search filters correctly", async () => {
      // Mock data
      const searchTerm = "MRI";
      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "MRI Scanner",
          complaint: "Calibration needed",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
          comments: [],
          notifications: [],
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequests(searchTerm);

      // Expect search WHERE clause to be built correctly
      const expectedWhere = {
        OR: [
          { medicalEquipment: { contains: searchTerm } },
          { complaint: { contains: searchTerm } },
        ],
      };

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should apply status filters correctly", async () => {
      // Mock data
      const filters: RequestFilterOptions = {
        status: ["Pending"],
      };

      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "CT Scanner",
          complaint: "Calibration needed",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
          comments: [],
          notifications: [],
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequests(undefined, filters);

      // Expect filter WHERE clause to be built correctly
      const expectedWhere = {
        status: { in: ["Pending"] },
      };

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should apply user filters correctly", async () => {
      // Mock data
      const filters: RequestFilterOptions = {
        userId: "user-123",
      };

      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "CT Scanner",
          complaint: "Calibration needed",
          status: "Pending",
          userId: "user-123",
          user: { id: "user-123", fullname: "Test User", username: "testuser" },
          comments: [],
          notifications: [],
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequests(undefined, filters);

      // Expect filter WHERE clause to be built correctly
      const expectedWhere = {
        userId: "user-123",
      };

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should apply date filters correctly", async () => {
      // Mock data
      const startDate = new Date("2023-01-01");
      const endDate = new Date("2023-12-31");

      const filters: RequestFilterOptions = {
        createdOnStart: startDate,
        createdOnEnd: endDate,
      };

      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "CT Scanner",
          complaint: "Calibration needed",
          status: "Pending",
          createdOn: new Date("2023-06-15"),
          user: { id: "user-1", fullname: "User One", username: "userone" },
          comments: [],
          notifications: [],
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequests(undefined, filters);

      // Expect date filter WHERE clause to be built correctly
      const expectedWhere = {
        createdOn: {
          gte: startDate,
          lte: endDate,
        },
      };

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should apply pagination correctly", async () => {
      // Mock data
      const pagination: PaginationOptions = {
        page: 2,
        limit: 10,
      };

      const mockRequests = [
        {
          id: "request-11",
          medicalEquipment: "MRI Scanner",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
          comments: [],
          notifications: [],
        },
        {
          id: "request-12",
          medicalEquipment: "X-Ray Machine",
          status: "Completed",
          user: { id: "user-2", fullname: "User Two", username: "usertwo" },
          comments: [],
          notifications: [],
        },
      ];
      const total = 25; // Total of 25 records, showing page 2 (records 11-20)

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequests(
        undefined,
        undefined,
        pagination,
      );

      // Calculate expected skip and take values
      const skip = (pagination.page - 1) * pagination.limit; // 10
      const take = pagination.limit; // 10

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip,
        take,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: {},
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should combine search, filters and pagination correctly", async () => {
      // Mock data
      const searchTerm = "MRI";
      const filters: RequestFilterOptions = {
        status: ["Pending"],
        userId: "user-1",
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 5,
      };

      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "MRI Scanner",
          complaint: "Not working properly",
          status: "Pending",
          userId: "user-1",
          user: { id: "user-1", fullname: "User One", username: "userone" },
          comments: [],
          notifications: [],
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequests(
        searchTerm,
        filters,
        pagination,
      );

      // Expect combined WHERE clause
      const expectedWhere = {
        OR: [
          { medicalEquipment: { contains: searchTerm } },
          { complaint: { contains: searchTerm } },
        ],
        status: { in: ["Pending"] },
        userId: "user-1",
      };

      // Calculate expected skip and take values
      const skip = (pagination.page - 1) * pagination.limit; // 0
      const take = pagination.limit; // 5

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip,
        take,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });
  });

  describe("getAllRequestMaintenance", () => {
    it("should fetch all maintenance requests with requestType filter", async () => {
      // Mock data
      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "CT Scanner",
          requestType: "MAINTENANCE",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
        },
        {
          id: "request-2",
          medicalEquipment: "X-Ray Machine",
          requestType: "MAINTENANCE",
          status: "Completed",
          user: { id: "user-2", fullname: "User Two", username: "usertwo" },
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequestMaintenance();

      // The where clause should include the requestType filter
      const expectedWhere = {
        requestType: "MAINTENANCE",
      };

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should combine filters with requestType for maintenance requests", async () => {
      // Mock data
      const filters: RequestFilterOptions = {
        status: ["Pending"],
      };

      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "CT Scanner",
          requestType: "MAINTENANCE",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequestMaintenance(
        undefined,
        filters,
      );

      // The where clause should include both the requestType and status filters
      const expectedWhere = {
        requestType: "MAINTENANCE",
        status: { in: ["Pending"] },
      };

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should handle case when pagination is undefined", async () => {
      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "CT Scanner",
          requestType: "MAINTENANCE",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
        },
        {
          id: "request-2",
          medicalEquipment: "X-Ray Machine",
          requestType: "MAINTENANCE",
          status: "Completed",
          user: { id: "user-2", fullname: "User Two", username: "usertwo" },
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      const result = await requestRepository.getAllRequestMaintenance();

      const expectedWhere = {
        requestType: "MAINTENANCE",
      };

      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should calculate skip and take correctly when pagination is provided", async () => {
      const page = 3;
      const limit = 7;
      const pagination: PaginationOptions = {
        page,
        limit,
      };

      const mockRequests = [
        {
          id: "request-15",
          medicalEquipment: "CT Scanner",
          requestType: "MAINTENANCE",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
        },
        {
          id: "request-16",
          medicalEquipment: "X-Ray Machine",
          requestType: "MAINTENANCE",
          status: "Completed",
          user: { id: "user-2", fullname: "User Two", username: "usertwo" },
        },
      ];
      const total = 25;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      const result = await requestRepository.getAllRequestMaintenance(
        undefined,
        undefined,
        pagination,
      );

      const expectedSkip = (page - 1) * limit; // 14 = (3-1) * 7
      const expectedTake = limit; // 7

      const expectedWhere = {
        requestType: "MAINTENANCE",
      };

      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: expectedSkip,
        take: expectedTake,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should handle first page pagination correctly", async () => {
      const pagination: PaginationOptions = {
        page: 1,
        limit: 5,
      };

      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "CT Scanner",
          requestType: "MAINTENANCE",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
        },
        {
          id: "request-2",
          medicalEquipment: "X-Ray Machine",
          requestType: "MAINTENANCE",
          status: "Completed",
          user: { id: "user-2", fullname: "User Two", username: "usertwo" },
        },
      ];
      const total = 10;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      const result = await requestRepository.getAllRequestMaintenance(
        undefined,
        undefined,
        pagination,
      );

      const expectedSkip = 0; // (1-1) * 5 = 0
      const expectedTake = 5;

      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: { requestType: "MAINTENANCE" },
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: expectedSkip,
        take: expectedTake,
      });

      // Check result
      expect(result.requests).toEqual(mockRequests);
      expect(result.total).toEqual(total);
    });

    it("should handle last page pagination correctly", async () => {
      const pagination: PaginationOptions = {
        page: 3,
        limit: 4,
      };

      const mockRequests = [
        {
          id: "request-9",
          medicalEquipment: "CT Scanner",
          requestType: "MAINTENANCE",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
        },
        {
          id: "request-10",
          medicalEquipment: "X-Ray Machine",
          requestType: "MAINTENANCE",
          status: "Completed",
          user: { id: "user-2", fullname: "User Two", username: "usertwo" },
        },
      ];
      const total = 10;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      const result = await requestRepository.getAllRequestMaintenance(
        undefined,
        undefined,
        pagination,
      );

      const expectedSkip = 8; // (3-1) * 4 = 8
      const expectedTake = 4;

      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: { requestType: "MAINTENANCE" },
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip: expectedSkip,
        take: expectedTake,
      });

      expect(result.requests).toEqual(mockRequests);
      expect(result.total).toEqual(total);
    });
  });

  describe("getAllRequestCalibration", () => {
    it("should fetch all calibration requests with requestType filter", async () => {
      // Mock data
      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "MRI Machine",
          requestType: "CALIBRATION",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
        },
        {
          id: "request-2",
          medicalEquipment: "ECG Machine",
          requestType: "CALIBRATION",
          status: "Completed",
          user: { id: "user-2", fullname: "User Two", username: "usertwo" },
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequestCalibration();

      // The where clause should include the requestType filter
      const expectedWhere = {
        requestType: "CALIBRATION",
      };

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdOn: "desc",
        },
        skip: undefined,
        take: undefined,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });

    it("should apply search, filters and pagination to calibration requests", async () => {
      // Mock data
      const searchTerm = "ECG";
      const filters: RequestFilterOptions = {
        status: ["Pending"],
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const mockRequests = [
        {
          id: "request-1",
          medicalEquipment: "ECG Machine",
          requestType: "CALIBRATION",
          status: "Pending",
          user: { id: "user-1", fullname: "User One", username: "userone" },
        },
      ];
      const total = mockRequests.length;

      // Setup mocks
      mockDb.request.findMany.mockResolvedValue(mockRequests);
      mockDb.request.count.mockResolvedValue(total);

      // Execute repository method
      const result = await requestRepository.getAllRequestCalibration(
        searchTerm,
        filters,
        pagination,
      );

      // Expect combined WHERE clause with requestType fixed to CALIBRATION
      const expectedWhere = {
        OR: [
          { medicalEquipment: { contains: searchTerm } },
          { complaint: { contains: searchTerm } },
        ],
        requestType: "CALIBRATION",
        status: { in: ["Pending"] },
      };

      // Calculate expected skip and take values
      const skip = (pagination.page - 1) * pagination.limit; // 0
      const take = pagination.limit; // 10

      // Check mocks were called correctly
      expect(mockDb.request.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: expect.any(Object),
        orderBy: {
          createdOn: "desc",
        },
        skip,
        take,
      });

      expect(mockDb.request.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      // Check result
      expect(result).toEqual({
        requests: mockRequests,
        total,
      });
    });
  });
});
