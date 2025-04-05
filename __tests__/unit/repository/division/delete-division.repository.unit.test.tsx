import DivisionRepository from "../../../../src/repository/division.repository";
import prisma from "../../../../src/configs/db.config";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/configs/db.config", () => ({
  user: {
    updateMany: jest.fn(),
  },
  listDivisi: {
    deleteMany: jest.fn(),
  },
}));

describe("DivisionRepository - DELETE", () => {
  let divisionRepository: DivisionRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    divisionRepository = new DivisionRepository();
  });

  it("should update users' divisiId to null and delete divisions, returning true", async () => {
    // Mock successful user update and division deletion
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({});
    (prisma.listDivisi.deleteMany as jest.Mock).mockResolvedValue({});

    const result = await divisionRepository.deleteDivision(1);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { divisiId: 1 },
      data: { divisiId: null },
    });
    expect(prisma.listDivisi.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [{ id: 1 }, { parentId: 1 }],
      },
    });
    expect(result).toBe(true);
  });

  it("should throw an AppError if user update fails", async () => {
    // Mock user update failure
    (prisma.user.updateMany as jest.Mock).mockRejectedValue(
      new Error("User update failed"),
    );

    await expect(divisionRepository.deleteDivision(1)).rejects.toThrow(
      AppError,
    );
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { divisiId: 1 },
      data: { divisiId: null },
    });
    expect(prisma.listDivisi.deleteMany).not.toHaveBeenCalled();
  });

  it("should throw an AppError with 'Unknown error' if the error is not an instance of Error", async () => {
    // Mock an unknown error (e.g., a string)
    (prisma.user.updateMany as jest.Mock).mockRejectedValue("Unknown failure");

    await expect(divisionRepository.deleteDivision(1)).rejects.toThrow(
      AppError,
    );
    await expect(divisionRepository.deleteDivision(1)).rejects.toThrow(
      "Failed to delete division with ID 1: Unknown error",
    );

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { divisiId: 1 },
      data: { divisiId: null },
    });
    expect(prisma.listDivisi.deleteMany).not.toHaveBeenCalled();
  });

  it("should throw an AppError if division deletion fails", async () => {
    // Mock successful user update but division deletion failure
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({});
    (prisma.listDivisi.deleteMany as jest.Mock).mockRejectedValue(
      new Error("Division deletion failed"),
    );

    await expect(divisionRepository.deleteDivision(1)).rejects.toThrow(
      AppError,
    );
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { divisiId: 1 },
      data: { divisiId: null },
    });
    expect(prisma.listDivisi.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [{ id: 1 }, { parentId: 1 }],
      },
    });
  });
});
