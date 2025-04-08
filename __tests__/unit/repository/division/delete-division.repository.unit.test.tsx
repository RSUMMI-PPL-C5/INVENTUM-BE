import DivisionRepository from "../../../../src/repository/division.repository";
import prisma from "../../../../src/configs/db.config";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/configs/db.config", () => ({
  user: {
    updateMany: jest.fn(),
  },
  listDivisi: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

describe("DivisionRepository - DELETE", () => {
  let divisionRepository: DivisionRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    divisionRepository = new DivisionRepository();
  });

  it("should delete the division and all its descendants, and update users' divisiId to null", async () => {
    // Mock data for descendants
    (prisma.listDivisi.findMany as jest.Mock)
      .mockResolvedValueOnce([{ id: 2 }, { id: 3 }]) // Children of ID 1
      .mockResolvedValueOnce([{ id: 4 }]) // Children of ID 2
      .mockResolvedValueOnce([]) // Children of ID 3
      .mockResolvedValueOnce([]); // Children of ID 4

    // Mock successful user update and division deletion
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({});
    (prisma.listDivisi.deleteMany as jest.Mock).mockResolvedValue({});

    const result = await divisionRepository.deleteDivision(1);

    // Verify recursive calls to find descendants
    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 1 },
      select: { id: true },
    });
    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 2 },
      select: { id: true },
    });
    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 3 },
      select: { id: true },
    });
    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 4 },
      select: { id: true },
    });

    // Verify user update
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: {
        divisiId: { in: [2, 3, 4, 1] },
      },
      data: {
        divisiId: null,
      },
    });

    // Verify division deletion
    expect(prisma.listDivisi.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: [2, 3, 4, 1] },
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
      where: {
        divisiId: { in: [1] },
      },
      data: {
        divisiId: null,
      },
    });
    expect(prisma.listDivisi.deleteMany).not.toHaveBeenCalled();
  });

  it("should throw an AppError if division deletion fails", async () => {
    // Mock successful user update but division deletion failure
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({});
    (prisma.listDivisi.deleteMany as jest.Mock).mockRejectedValue(
      new Error("Division deletion failed"),
    );

    await expect(divisionRepository.deleteDivision(1)).rejects.toThrow(
      AppError,
    );
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: {
        divisiId: { in: [1] },
      },
      data: {
        divisiId: null,
      },
    });
    expect(prisma.listDivisi.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: [1] },
      },
    });
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
      where: {
        divisiId: { in: [1] },
      },
      data: {
        divisiId: null,
      },
    });
    expect(prisma.listDivisi.deleteMany).not.toHaveBeenCalled();
  });
});