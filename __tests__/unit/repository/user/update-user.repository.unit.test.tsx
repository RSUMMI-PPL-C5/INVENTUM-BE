import UserRepository from "../../../../src/repository/user.repository";
import { UserDTO } from "../../../../src/dto/user.dto";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockUpdate = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        update: mockUpdate,
      },
    })),
    __mockPrisma: {
      update: mockUpdate,
    },
  };
});

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("User Repository - PUT", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
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

    await expect(
      userRepository.updateUser("1", { fullname: "Updated User One" }),
    ).rejects.toThrow(errorMessage);
    expect(mockPrisma.update).toHaveBeenCalledTimes(1);
  });

  // Negative Case: Update with invalid ID
  it("should return null if the user ID does not exist", async () => {
    (mockPrisma.update as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.updateUser("999", {
      fullname: "Nonexistent User",
    });

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: {
        id: "999",
      },
      data: { fullname: "Nonexistent User" },
    });
    expect(result).toBeNull();
  });

  // Corner Case: Update with empty data
  it("should throw an error if no data is provided for update", async () => {
    const errorMessage = "No data provided for update";
    (mockPrisma.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.updateUser("1", {})).rejects.toThrow(
      errorMessage,
    );
    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
      data: {},
    });
  });

  // Corner Case: Update with invalid data type
  it("should throw an error if invalid data type is provided", async () => {
    const errorMessage = "Invalid data type";
    (mockPrisma.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(
      userRepository.updateUser("1", { fullname: 12345 as unknown as string }),
    ).rejects.toThrow(errorMessage);
    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
      data: { fullname: 12345 },
    });
  });
});
