import DivisionRepository from "../../../../src/repository/division.repository";
import prisma from "../../../../src/configs/db.config";

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

  it("should throw an Error if user update fails", async () => {
    // Mock data for descendants (empty in this case)
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValue([]);

    // Mock user update failure
    (prisma.user.updateMany as jest.Mock).mockRejectedValue(
      new Error("User update failed"),
    );

    await expect(divisionRepository.deleteDivision(1)).rejects.toThrow(
      "Failed to delete division with ID 1: User update failed",
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

  it("should return an empty array when division has no children", async () => {
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValue([]);

    const result = await divisionRepository.getAllChildrenIds(1);

    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 1 },
      select: { id: true },
    });
    expect(result).toEqual([]);
  });

  it("should return direct children IDs when there are no descendants", async () => {
    (prisma.listDivisi.findMany as jest.Mock)
      .mockResolvedValueOnce([{ id: 2 }, { id: 3 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await divisionRepository.getAllChildrenIds(1);

    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 1 },
      select: { id: true },
    });
    expect(result).toEqual([2, 3]);
  });

  it("should return all descendant IDs in a nested hierarchy", async () => {
    (prisma.listDivisi.findMany as jest.Mock)
      .mockResolvedValueOnce([{ id: 2 }, { id: 3 }]) // Children of ID 1
      .mockResolvedValueOnce([{ id: 4 }, { id: 5 }]) // Children of ID 2
      .mockResolvedValueOnce([]) // Children of ID 3
      .mockResolvedValueOnce([{ id: 6 }]) // Children of ID 4
      .mockResolvedValueOnce([]) // Children of ID 5
      .mockResolvedValueOnce([]); // Children of ID 6

    const result = await divisionRepository.getAllChildrenIds(1);

    expect(result).toEqual([2, 3, 4, 5, 6]);

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
  });

  it("should handle when findMany returns null", async () => {
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValue(null);

    const result = await divisionRepository.getAllChildrenIds(1);

    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 1 },
      select: { id: true },
    });
    expect(result).toEqual([]);
  });

  it("should handle when findMany returns undefined", async () => {
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValue(undefined);

    const result = await divisionRepository.getAllChildrenIds(1);

    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 1 },
      select: { id: true },
    });
    expect(result).toEqual([]);
  });

  it("should handle database errors gracefully", async () => {
    const error = new Error("Database connection error");
    (prisma.listDivisi.findMany as jest.Mock).mockRejectedValue(error);

    await expect(divisionRepository.getAllChildrenIds(1)).rejects.toThrow(
      error,
    );

    expect(prisma.listDivisi.findMany).toHaveBeenCalledWith({
      where: { parentId: 1 },
      select: { id: true },
    });
  });

  it("should throw an Error if division deletion fails", async () => {
    // Mock data for descendants (empty in this case)
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValue([]);

    // Mock successful user update but division deletion failure
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({});
    (prisma.listDivisi.deleteMany as jest.Mock).mockRejectedValue(
      new Error("Division deletion failed"),
    );

    await expect(divisionRepository.deleteDivision(1)).rejects.toThrow(
      "Failed to delete division with ID 1: Division deletion failed",
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

  it("should throw an Error with 'Unknown error' if the error is not an instance of Error", async () => {
    // Mock data for descendants (empty in this case)
    (prisma.listDivisi.findMany as jest.Mock).mockResolvedValue([]);

    // Mock an unknown error (e.g., a string)
    (prisma.user.updateMany as jest.Mock).mockRejectedValue("Unknown failure");

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
