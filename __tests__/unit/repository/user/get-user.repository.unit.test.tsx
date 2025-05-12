import UserRepository from "../../../../src/repository/user.repository";
import { UserDTO } from "../../../../src/dto/user.dto";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockFindMany = jest.fn();
  const mockFindFirst = jest.fn();
  const mockCount = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findMany: mockFindMany,
        findFirst: mockFindFirst,
        count: mockCount,
      },
    })),
    __mockPrisma: {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      count: mockCount,
    },
  };
});

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("User Repository - GET", () => {
  let userRepository: UserRepository;
  const mockUsers: UserDTO[] = [
    {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedpwd1",
      role: "USER",
      fullname: "User One",
      nokar: "12345",
      divisiId: 1,
      waNumber: "123456789",
      createdBy: "1",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    },
    {
      id: "2",
      email: "user2@example.com",
      username: "user2",
      password: "hashedpwd2",
      role: "ADMIN",
      fullname: "User Two",
      nokar: "67890",
      divisiId: 2,
      waNumber: "987654321",
      createdBy: "1",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  describe("getUsers", () => {
    it("should return paginated users with total count", async () => {
      (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (mockPrisma.count as jest.Mock).mockResolvedValue(2);

      const result = await userRepository.getUsers(undefined, undefined, {
        page: 1,
        limit: 10,
      });

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
        skip: 0,
        take: 10,
        include: { divisi: true },
        orderBy: { modifiedOn: "desc" },
      });
      expect(mockPrisma.count).toHaveBeenCalledWith({
        where: { deletedOn: null },
      });
      expect(result).toEqual({ users: mockUsers, total: 2 });
    });

    it("should return empty users if no data found", async () => {
      (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.count as jest.Mock).mockResolvedValue(0);

      const result = await userRepository.getUsers(undefined, undefined, {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({ users: [], total: 0 });
    });

    it("should handle edge case when pagination is not provided", async () => {
      (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (mockPrisma.count as jest.Mock).mockResolvedValue(2);

      const result = await userRepository.getUsers();

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
        skip: undefined,
        take: undefined,
        include: { divisi: true },
        orderBy: { modifiedOn: "desc" },
      });
      expect(result).toEqual({ users: mockUsers, total: 2 });
    });

    it("should handle edge case when filters are empty", async () => {
      (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (mockPrisma.count as jest.Mock).mockResolvedValue(2);

      const result = await userRepository.getUsers(
        undefined,
        {},
        { page: 1, limit: 10 },
      );

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
        skip: 0,
        take: 10,
        include: { divisi: true },
        orderBy: { modifiedOn: "desc" },
      });
      expect(result).toEqual({ users: mockUsers, total: 2 });
    });
  });

  describe("getUsers - Additional Cases", () => {
    it("should apply search filter correctly", async () => {
      const search = "User";
      (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.count as jest.Mock).mockResolvedValue(0);

      await userRepository.getUsers(search);

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: {
          deletedOn: null,
          OR: [
            { fullname: { contains: search } },
            { email: { contains: search } },
            { username: { contains: search } },
          ],
        },
        skip: undefined,
        take: undefined,
        include: { divisi: true },
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should apply role and divisiId filters correctly", async () => {
      const filters = { role: ["ADMIN"], divisiId: [2] };
      (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.count as jest.Mock).mockResolvedValue(0);

      await userRepository.getUsers(undefined, filters);

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: {
          deletedOn: null,
          role: { in: filters.role },
          divisiId: { in: filters.divisiId },
        },
        skip: undefined,
        take: undefined,
        include: { divisi: true },
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should apply createdOnStart and createdOnEnd filters correctly", async () => {
      const filters = {
        createdOnStart: new Date("2023-01-01"), // Konversi ke Date
        createdOnEnd: new Date("2023-12-31"), // Konversi ke Date
      };
      (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.count as jest.Mock).mockResolvedValue(0);

      await userRepository.getUsers(undefined, filters);

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: {
          deletedOn: null,
          createdOn: {
            gte: new Date(filters.createdOnStart),
            lte: new Date(filters.createdOnEnd),
          },
        },
        skip: undefined,
        take: undefined,
        include: { divisi: true },
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should apply modifiedOnStart and modifiedOnEnd filters correctly", async () => {
      const filters = {
        modifiedOnStart: new Date("2023-01-01"), // Konversi ke Date
        modifiedOnEnd: new Date("2023-12-31"), // Konversi ke Date
      };
      (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.count as jest.Mock).mockResolvedValue(0);

      await userRepository.getUsers(undefined, filters);

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: {
          deletedOn: null,
          modifiedOn: {
            gte: new Date(filters.modifiedOnStart),
            lte: new Date(filters.modifiedOnEnd),
          },
        },
        skip: undefined,
        take: undefined,
        include: { divisi: true },
        orderBy: { modifiedOn: "desc" },
      });
    });

    it("should apply search, filters, and pagination together", async () => {
      const search = "User";
      const filters = { role: ["USER"], divisiId: [1] };
      const pagination = { page: 2, limit: 5 };
      (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.count as jest.Mock).mockResolvedValue(0);

      await userRepository.getUsers(search, filters, pagination);

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: {
          deletedOn: null,
          OR: [
            { fullname: { contains: search } },
            { email: { contains: search } },
            { username: { contains: search } },
          ],
          role: { in: filters.role },
          divisiId: { in: filters.divisiId },
        },
        skip: 5, // (page - 1) * limit = (2 - 1) * 5
        take: 5,
        include: { divisi: true },
        orderBy: { modifiedOn: "desc" },
      });
    });
  });

  describe("getUserById", () => {
    it("should return a user by ID", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(mockUsers[0]);

      const result = await userRepository.getUserById("1");

      expect(mockPrisma.findFirst).toHaveBeenCalledWith({
        where: {
          id: "1",
          deletedOn: null,
        },
        include: { divisi: true },
      });
      expect(result).toEqual({
        ...mockUsers[0],
        divisionName: null,
      });
    });

    it("should return null if user not found", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.getUserById("999");

      expect(result).toBeNull();
    });

    it("should handle edge case when ID is empty", async () => {
      const result = await userRepository.getUserById("");

      expect(result).toBeNull();
    });

    it("should set divisionName to null when user.divisi is null", async () => {
      const userWithNullDivisi = {
        ...mockUsers[0],
        divisi: null,
      };

      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(userWithNullDivisi);

      const result = await userRepository.getUserById("1");

      expect(mockPrisma.findFirst).toHaveBeenCalledWith({
        where: {
          id: "1",
          deletedOn: null,
        },
        include: { divisi: true },
      });

      expect(result).toEqual({
        ...userWithNullDivisi,
        divisionName: null,
      });
      expect(result?.divisionName).toBeNull();
    });

    it("should set divisionName to the divisi.divisi value when available", async () => {
      const userWithDivisi = {
        ...mockUsers[0],
        divisi: {
          id: 1,
          divisi: "Engineering",
          parentId: null,
        },
      };

      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(userWithDivisi);

      const result = await userRepository.getUserById("1");

      expect(mockPrisma.findFirst).toHaveBeenCalledWith({
        where: {
          id: "1",
          deletedOn: null,
        },
        include: { divisi: true },
      });

      expect(result).toEqual({
        ...userWithDivisi,
        divisionName: "Engineering",
      });
      expect(result?.divisionName).toBe("Engineering");
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by email", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(mockUsers[0]);

      const result = await userRepository.getUserByEmail("user1@example.com");

      expect(mockPrisma.findFirst).toHaveBeenCalledWith({
        where: {
          email: "user1@example.com",
          deletedOn: null,
        },
        include: { divisi: true },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it("should return null if email not found", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.getUserByEmail(
        "notfound@example.com",
      );

      expect(result).toBeNull();
    });

    it("should handle edge case when email is empty", async () => {
      const result = await userRepository.getUserByEmail("");

      expect(result).toBeNull();
    });
  });

  describe("getUserByUsername", () => {
    it("should return a user by username", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(mockUsers[0]);

      const result = await userRepository.getUserByUsername("user1");

      expect(mockPrisma.findFirst).toHaveBeenCalledWith({
        where: {
          username: "user1",
          deletedOn: null,
        },
        include: { divisi: true },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it("should return null if username not found", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.getUserByUsername("notfound");

      expect(result).toBeNull();
    });

    it("should handle edge case when username is empty", async () => {
      const result = await userRepository.getUserByUsername("");

      expect(result).toBeNull();
    });
  });

  describe("getUserByNokar", () => {
    it("should return a user by nokar", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(mockUsers[0]);

      const result = await userRepository.getUserByNokar("12345");

      expect(mockPrisma.findFirst).toHaveBeenCalledWith({
        where: {
          nokar: "12345",
          deletedOn: null,
        },
        include: { divisi: true },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it("should return null if nokar not found", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.getUserByNokar("99999");

      expect(result).toBeNull();
    });

    it("should handle edge case when nokar is empty", async () => {
      const result = await userRepository.getUserByNokar("");

      expect(result).toBeNull();
    });
  });
});
