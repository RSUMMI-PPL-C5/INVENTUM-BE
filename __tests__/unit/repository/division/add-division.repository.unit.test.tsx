import { DivisionDTO } from "../../../../src/dto/division.dto";
import DivisionRepository from "../../../../src/repository/division.repository";

jest.mock("@prisma/client", () => {
  const mockCreate = jest.fn();
  const mockFindUnique = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      listDivisi: {
        create: mockCreate,
        findUnique: mockFindUnique,
      },
    })),
    __mockPrisma: {
      create: mockCreate,
      findUnique: mockFindUnique,
    },
  };
});

const { __mockPrisma: mockPrisma } = jest.requireMock("@prisma/client");

describe("DivisionRepository - ADD", () => {
  let divisionRepository: DivisionRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    divisionRepository = new DivisionRepository();
  });

  it("should add a new list divisi", async () => {
    const mockNewDivision: DivisionDTO = {
      id: 2,
      divisi: "Divisi 2",
      parentId: 1,
    };

    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: 1,
    };

    mockPrisma.create.mockResolvedValue(mockNewDivision);

    const result = await divisionRepository.addDivision(addData);

    expect(mockPrisma.create).toHaveBeenCalledWith({ data: addData });
    expect(result).toEqual(mockNewDivision);
  });

  it("should throw an error if failed to add a new list divisi", async () => {
    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: 99,
    };

    mockPrisma.create.mockRejectedValue(new Error("Failed to add list divisi"));

    await expect(divisionRepository.addDivision(addData)).rejects.toThrow(
      "Failed to add list divisi",
    );
  });

  it("should get divisi by id", async () => {
    const mockNewDivision: DivisionDTO = {
      id: 2,
      divisi: "Divisi 2",
      parentId: 1,
    };

    mockPrisma.findUnique.mockResolvedValue(mockNewDivision);

    const result = await divisionRepository.getDivisionById(2);

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(result).toEqual(mockNewDivision);
  });

  it("should return null if divisi not found", async () => {
    mockPrisma.findUnique.mockResolvedValue(null);

    const result = await divisionRepository.getDivisionById(99);

    expect(mockPrisma.findUnique).toHaveBeenCalledWith({ where: { id: 99 } });
    expect(result).toBeNull();
  });
});
