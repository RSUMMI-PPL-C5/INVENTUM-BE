import { Prisma } from "@prisma/client";
import UserRepository from "../../../src/repository/user.repository";
import { UserDTO, AddUserResponseDTO } from "../../../src/dto/user.dto";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockFindMany = jest.fn();
  const mockFindUnique = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        update: mockUpdate,
        delete: mockDelete,
      },
    })),
    __mockPrisma: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      update: mockUpdate,
      delete: mockDelete,
    },
  };
});

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("User Repository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  test("should find user by name", async () => {
    const mockUser = [
      { id: "1", fullname: "Azmy Arya Rizaldi", email: "azmy@gmail.com" },
    ];
    (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findUsersByName("Azmy");
    expect(result).toEqual(mockUser);
  });

  test("should return an empty array if user is not found by name", async () => {
    (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);

    const result = await userRepository.findUsersByName("John Doe");
    expect(result).toEqual([]);
  });

  it("should return a list of users", async () => {
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
    (mockPrisma.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const result = await userRepository.getUsers();

    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
    expect(result.length).toBe(mockUsers.length);
    expect(result[0].id).toBe(mockUsers[0].id);
  });

  it("should return an empty list if no users found", async () => {
    (mockPrisma.findMany as jest.Mock).mockResolvedValue([]);

    const result = await userRepository.getUsers();

    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it("should throw an error if the database query fails", async () => {
    const errorMessage = "Database connection error";
    (mockPrisma.findMany as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.getUsers()).rejects.toThrow(errorMessage);
    expect(mockPrisma.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return a user by ID when ID is valid", async () => {
    const mockUser: UserDTO = {
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
    };

    (mockPrisma.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.getUserById("1");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found by ID", async () => {
    (mockPrisma.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.getUserById("1");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toBeNull();
  });

  it("should return a user by username when username is valid", async () => {
    const mockUser: UserDTO = {
      id: "1",
      email: "user1@example.com",
      username: "testuser",
      password: "hashedpwd",
      role: "USER",
      fullname: "Test User",
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

    (mockPrisma.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findByUsername("testuser");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        username: "testuser",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found by username", async () => {
    (mockPrisma.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.findByUsername("testuser");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: {
        username: "testuser",
      },
    });
    expect(result).toBeNull();
  });

  it("should update a user by ID", async () => {
    const mockUser: UserDTO = {
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
    };

    const updatedData: Partial<UserDTO> = {
      fullname: "Updated User One",
    };

    const updatedUser: UserDTO = {
      ...mockUser,
      ...updatedData,
    };

    (mockPrisma.update as jest.Mock).mockResolvedValue(updatedUser);

    const result = await userRepository.updateUser("1", updatedData);

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
      data: updatedData,
    });
    expect(result).toEqual(updatedUser);
  });

  it("should throw an error if the update fails", async () => {
    const errorMessage = "Update failed";
    (mockPrisma.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.updateUser("1", { fullname: "Updated User One" })).rejects.toThrow(errorMessage);
    expect(mockPrisma.update).toHaveBeenCalledTimes(1);
  });

  it("should delete a user by ID", async () => {
    const mockUser: UserDTO = {
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
    };

    (mockPrisma.delete as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.deleteUser("1");

    expect(mockPrisma.delete).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found to delete", async () => {
    (mockPrisma.delete as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.deleteUser("999");

    expect(mockPrisma.delete).toHaveBeenCalledWith({
      where: {
        id: "999",
      },
    });
    expect(result).toBeNull();
  });

  it("should throw an error if the delete fails", async () => {
    const errorMessage = "Delete failed";
    (mockPrisma.delete as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.deleteUser("1")).rejects.toThrow(errorMessage);
    expect(mockPrisma.delete).toHaveBeenCalledTimes(1);
  });
});

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

    await expect(userRepository.createUser(newUserData)).rejects.toThrow(errorMessage);
    expect(mockPrisma.create).toHaveBeenCalledTimes(1);
  });

  // Test for getFilteredUsers method
  it("should return users filtered by query", async () => {
    const filter: Prisma.UserWhereInput = { role: "USER" };
    const mockFilteredUsers: UserDTO[] = [
      { id: "1", email: "user1@example.com", username: "user1", password:"password123", role: "USER", fullname: "User One", nokar: "12345", divisiId: 1, waNumber: "123456789", createdBy: 1, createdOn: new Date(), modifiedBy: null, modifiedOn: new Date(), deletedBy: null, deletedOn: null },
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

    const result = await userRepository.getUserByEmail("nonexistent@example.com");

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({
      where: { email: "nonexistent@example.com" },
    });
    expect(result).toBeNull();
  });

  // Test for getUsers method
  it("should return a list of users", async () => {
    const mockUsers: UserDTO[] = [
      { id: "1", email: "user1@example.com", username: "user1", role: "USER", password:"password123", fullname: "User One", nokar: "12345", divisiId: 1, waNumber: "123456789", createdBy: 1, createdOn: new Date(), modifiedBy: null, modifiedOn: new Date(), deletedBy: null, deletedOn: null },
      { id: "2", email: "user2@example.com", username: "user2", role: "ADMIN", password:"password123", fullname: "User Two", nokar: "67890", divisiId: 2, waNumber: "987654321", createdBy: 1, createdOn: new Date(), modifiedBy: null, modifiedOn: new Date(), deletedBy: null, deletedOn: null },
    ];

    mockPrisma.findMany.mockResolvedValue(mockUsers);

    const result = await userRepository.getUsers();

    expect(mockPrisma.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
    expect(result.length).toBe(mockUsers.length);
  });

  // Test for updateUser method
  it("should update a user by ID", async () => {
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

    const updatedData: Partial<UserDTO> = { fullname: "Updated User One" };
    const updatedUser: UserDTO = { ...mockUser, ...updatedData };

    mockPrisma.update.mockResolvedValue(updatedUser);

    const result = await userRepository.updateUser("1", updatedData);

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: updatedData,
    });
    expect(result).toEqual(updatedUser);
  });

  it("should throw an error if the update fails", async () => {
    const errorMessage = "Update failed";
    mockPrisma.update.mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.updateUser("1", { fullname: "Updated User One" })).rejects.toThrow(errorMessage);
    expect(mockPrisma.update).toHaveBeenCalledTimes(1);
  });

  // Test for deleteUser method
  it("should delete a user by ID", async () => {
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

    mockPrisma.delete.mockResolvedValue(mockUser);

    const result = await userRepository.deleteUser("1");

    expect(mockPrisma.delete).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null if no user found to delete", async () => {
    mockPrisma.delete.mockResolvedValue(null);

    const result = await userRepository.deleteUser("999");

    expect(mockPrisma.delete).toHaveBeenCalledWith({
      where: { id: "999" },
    });
    expect(result).toBeNull();
  });

  it("should throw an error if the delete fails", async () => {
    const errorMessage = "Delete failed";
    mockPrisma.delete.mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.deleteUser("1")).rejects.toThrow(errorMessage);
    expect(mockPrisma.delete).toHaveBeenCalledTimes(1);
  });
});
