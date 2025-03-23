import DivisionRepository from "../../../../src/repository/division.repository";
import prisma from "../../../../src/configs/db.config";

jest.mock("../../../../src/configs/db.config", () => ({
  listDivisi: {
    delete: jest.fn(),
  },
}));

describe("DivisionRepository - DELETE", () => {
  let divisionRepository: DivisionRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    divisionRepository = new DivisionRepository();
  });

  it("should delete a division and return true", async () => {
    (prisma.listDivisi.delete as jest.Mock).mockResolvedValue({});

    const result = await divisionRepository.deleteDivision(1);

    expect(prisma.listDivisi.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toBe(true);
  });

  it("should return false if deletion fails", async () => {
    (prisma.listDivisi.delete as jest.Mock).mockRejectedValue(
      new Error("Delete failed"),
    );

    const result = await divisionRepository.deleteDivision(1);

    expect(prisma.listDivisi.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toBe(false);
  });
});
