import { Prisma } from "@prisma/client";
import UserRepository from "../../../../src/repository/user.repository";
import { UserDTO, AddUserResponseDTO } from "../../../../src/dto/user.dto";

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockCreate = jest.fn();
  const mockFindMany = jest.fn();
  const mockFindUnique = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        create: mockCreate,
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        update: mockUpdate,
        delete: mockDelete,
      },
    })),
    __mockPrisma: {
      create: mockCreate,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      update: mockUpdate,
      delete: mockDelete,
    },
  };
});

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  // Test for createUser method
  it("should create a new user successfully", async () => {
    const newUserData = {
      email: "user1@example.com",
      username: "user1",
      password: "hashedPassword1",
    };

    const mockResponse: AddUserResponseDTO = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
    };

    mockPrisma.create.mockResolvedValue(mockResponse);

    const result = await userRepository.createUser(newUserData);

    expect(mockPrisma.create).toHaveBeenCalledWith({
      data: newUserData,
      select: {
        id: true,
        email: true,
        username: true,
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it("should throw an error if user creation fails", async () => {
    const errorMessage = "User creation failed";
    const newUserData = {
      email: "user2@example.com",
      username: "user2",
      password: "hashedPassword2",
    };

    mockPrisma.create.mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.createUser(newUserData)).rejects.toThrow(
      errorMessage,
    );
    expect(mockPrisma.create).toHaveBeenCalledTimes(1);
  });

  // Test for getFilteredUsers method
  it("should return users filtered by query", async () => {
    const filter: Prisma.UserWhereInput = { role: "USER" };
    const mockFilteredUsers: UserDTO[] = [
      {
        id: "1",
        email: "user1@example.com",
        username: "user1",
        password: "password123",
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
    ];

    mockPrisma.findMany.mockResolvedValue(mockFilteredUsers);

    const result = await userRepository.getFilteredUsers(filter);

    expect(mockPrisma.findMany).toHaveBeenCalledWith({ where: filter });
    expect(result).toEqual(mockFilteredUsers);
  });

  it("should return an empty list if no users match the filter", async () => {
    const filter: Prisma.UserWhereInput = { role: "ADMIN" };

    mockPrisma.findMany.mockResolvedValue([]);

    const result = await userRepository.getFilteredUsers(filter);

    expect(mockPrisma.findMany).toHaveBeenCalledWith({ where: filter });
    expect(result).toEqual([]);
  });

  // Test for getUserByEmail method
  it("should return a user when found by email", async () => {
    const mockUser: UserDTO = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
      password: "hashedPassword1",
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
    };

    mockPrisma.findUnique.mockResolvedValue(mockUser);

    const result = await userRepository.getUserByEmail("user1@example.com");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: { email: "user1@example.com" },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user is found by email", async () => {
    mockPrisma.findUnique.mockResolvedValue(null);

    const result = await userRepository.getUserByEmail(
      "nonexistent@example.com",
    );

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: { email: "nonexistent@example.com" },
    });
    expect(result).toBeNull();
  });

  // Test for getUsers method
  it("should return a list of users", async () => {
    const mockUsers: UserDTO[] = [
      {
        id: "1",
        email: "user1@example.com",
        username: "user1",
        role: "USER",
        password: "password123",
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
        role: "ADMIN",
        password: "password123",
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

    mockPrisma.findMany.mockResolvedValue(mockUsers);

    const result = await userRepository.getUsers();

    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
    expect(result.length).toBe(mockUsers.length);
  });
});
