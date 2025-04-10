import UserRepository from "../../../../src/repository/user.repository";
import { UserDTO } from "../../../../src/dto/user.dto";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockFindMany = jest.fn();
  const mockFindFirst = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findMany: mockFindMany,
        findFirst: mockFindFirst,
      },
    })),
    __mockPrisma: {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
    },
    Prisma: {
      UserWhereInput: jest.fn(),
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
      createdBy: 1,
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
      createdBy: 1,
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
    it("should return all non-deleted users", async () => {
      (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userRepository.getUsers();

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: { deletedOn: null },
      });
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array when no users exist", async () => {
      (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);

      const result = await userRepository.getUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getFilteredUsers", () => {
    it("should return filtered users based on criteria", async () => {
      const whereClause = { role: "ADMIN" };
      (mockPrisma.findMany as jest.Mock).mockResolvedValue([mockUsers[1]]);

      const result = await userRepository.getFilteredUsers(whereClause);

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: {
          ...whereClause,
          deletedOn: null,
        },
      });
      expect(result).toEqual([mockUsers[1]]);
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
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it("should return null if user not found", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.getUserById("999");

      expect(result).toBeNull();
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
      });
      expect(result).toEqual(mockUsers[0]);
    });
  });

  describe("findUsersByName", () => {
    it("should return users matching name query", async () => {
      (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userRepository.findUsersByName("User");

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: {
          fullname: {
            contains: "User",
          },
          deletedOn: null,
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe("findByUsername", () => {
    it("should return a user by username", async () => {
      (mockPrisma.findFirst as jest.Mock).mockResolvedValue(mockUsers[0]);

      const result = await userRepository.findByUsername("user1");

      expect(mockPrisma.findFirst).toHaveBeenCalledWith({
        where: {
          username: "user1",
          deletedOn: null,
        },
      });
      expect(result).toEqual(mockUsers[0]);
    });
  });
});