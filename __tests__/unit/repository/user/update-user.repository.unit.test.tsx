import UserRepository from "../../../../src/repository/user.repository";
import { UserDTO } from "../../../../src/dto/user.dto";
import { getJakartaTime } from "../../../../src/utils/date.utils";

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

// Mock getJakartaTime
jest.mock("../../../../src/utils/date.utils", () => ({
  getJakartaTime: jest.fn(),
}));

// Get access to the mocked Prisma functions
const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("User Repository - UPDATE", () => {
  let userRepository: UserRepository;
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
    createdBy: "1",
    createdOn: new Date(),
    modifiedBy: null,
    modifiedOn: new Date(),
    deletedBy: null,
    deletedOn: null,
  };

  let mockDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
    mockDate = new Date();
    (getJakartaTime as jest.Mock).mockReturnValue(mockDate);
  });

  it("should update a user's information", async () => {
    const updateData = {
      fullname: "Updated User One",
      waNumber: "555555555",
      modifiedBy: "2",
    };

    const updatedUser = { ...mockUser, ...updateData, modifiedOn: mockDate };
    (mockPrisma.update as jest.Mock).mockResolvedValue(updatedUser);

    const result = await userRepository.updateUser("1", updateData);

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        ...updateData,
        modifiedOn: mockDate,
      },
    });
    expect(result).toEqual(updatedUser);
  });

  it("should return null if no user found to update", async () => {
    const updateData = { fullname: "New Name" };
    (mockPrisma.update as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.updateUser("999", updateData);

    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "999" },
      data: {
        ...updateData,
        modifiedOn: mockDate,
      },
    });
    expect(result).toBeNull();
  });

  it("should throw an error if the update fails", async () => {
    const updateData = { fullname: "New Name" };
    const errorMessage = "Update failed";
    (mockPrisma.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.updateUser("1", updateData)).rejects.toThrow(
      errorMessage,
    );
    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        ...updateData,
        modifiedOn: mockDate,
      },
    });
  });

  // Corner Case: Update with empty data
  it("should throw an error if no data is provided for update", async () => {
    const errorMessage = "No data provided for update";
    (mockPrisma.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(userRepository.updateUser("1", {})).rejects.toThrow(
      errorMessage,
    );
    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        modifiedOn: mockDate,
      },
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
      where: { id: "1" },
      data: {
        fullname: 12345,
        modifiedOn: mockDate,
      },
    });
  });

  // Corner Case: Database connection error
  it("should throw an error if there is a database connection error", async () => {
    const errorMessage = "Database connection error";
    (mockPrisma.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(
      userRepository.updateUser("1", { fullname: "Updated User One" }),
    ).rejects.toThrow(errorMessage);
    expect(mockPrisma.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        fullname: "Updated User One",
        modifiedOn: mockDate,
      },
    });
  });
});
