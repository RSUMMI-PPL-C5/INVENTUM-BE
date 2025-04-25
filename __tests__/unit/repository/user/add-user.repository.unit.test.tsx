import UserRepository from "../../../../src/repository/user.repository";
import { AddUserResponseDTO } from "../../../../src/dto/user.dto";

// Mock the date utility - ensure the path matches your import exactly
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest
    .fn()
    .mockReturnValue(new Date("2025-04-21T00:00:00.000Z")),
}));

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockCreate = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        create: mockCreate,
      },
    })),
    __mockPrisma: {
      create: mockCreate,
    },
  };
});

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("User Repository - ADD", () => {
  let userRepository: UserRepository;
  const mockDate = new Date("2025-04-21T00:00:00.000Z");

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  it("should create a new user successfully", async () => {
    const userData = {
      email: "user1@example.com",
      username: "user1",
      password: "hashedpwd1",
      role: "USER",
      fullname: "User One",
      nokar: "12345",
      divisiId: 1,
      waNumber: "123456789",
      createdBy: 1,
    };

    const expectedResponse: AddUserResponseDTO = {
      id: "1",
      email: "user1@example.com",
      username: "user1",
    };

    (mockPrisma.create as jest.Mock).mockResolvedValue(expectedResponse);

    const result = await userRepository.createUser(userData);

    expect(mockPrisma.create).toHaveBeenCalledWith({
      data: {
        ...userData,
        createdOn: mockDate,
        modifiedOn: mockDate,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdOn: true,
        createdBy: true,
      },
    });
    expect(result).toEqual(expectedResponse);
  });

  // Update the other test cases similarly
  it("should throw an error if user creation fails", async () => {
    const userData = {
      email: "user2@example.com",
      username: "user2",
      password: "hashedpwd2",
    };

    const errorMessage = "User creation failed";
    (mockPrisma.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.createUser(userData)).rejects.toThrow(
      errorMessage,
    );
    expect(mockPrisma.create).toHaveBeenCalledTimes(1);
  });

  it("should handle missing optional fields gracefully", async () => {
    const userData = {
      email: "user3@example.com",
      username: "user3",
      password: "hashedpwd3",
      createdBy: 1,
    };

    const expectedResponse: AddUserResponseDTO = {
      id: "3",
      email: "user3@example.com",
      username: "user3",
    };

    (mockPrisma.create as jest.Mock).mockResolvedValue(expectedResponse);

    const result = await userRepository.createUser(userData);

    expect(mockPrisma.create).toHaveBeenCalledWith({
      data: {
        ...userData,
        createdOn: mockDate,
        modifiedOn: mockDate,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdOn: true,
        createdBy: true,
      },
    });
    expect(result).toEqual(expectedResponse);
  });
});
