import { DivisionDTO } from "../../../../src/dto/division.dto";
import { IDivisionService } from "../../../../src/services/interface/division.service.interface";
import DivisionRepository from "../../../../src/repository/division.repository";
import DivisionService from "../../../../src/services/division.service";

jest.mock("../../../../src/repository/division.repository");

describe("DivisionService - ADD", () => {
  let divisionService: IDivisionService;
  let mockDivisionRepository: jest.Mocked<DivisionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDivisionRepository =
      new DivisionRepository() as jest.Mocked<DivisionRepository>;
    divisionService = new DivisionService();
    (divisionService as any).divisionRepository = mockDivisionRepository;
  });

  it("should add a new divisi with valid parentId", async () => {
    const mockNewDivision = {
      id: 2,
      divisi: "Divisi 2",
      parentId: 1,
    };

    const mockParentDivision: DivisionDTO = {
      id: 1,
      divisi: "Divisi 1",
      parentId: null,
    };

    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: 1,
    };

    mockDivisionRepository.getDivisionById.mockResolvedValue(
      mockParentDivision,
    );
    mockDivisionRepository.addDivision.mockResolvedValue(mockNewDivision);

    const result = await divisionService.addDivision(addData);

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.addDivision).toHaveBeenCalledWith(addData);
    expect(result).toEqual(mockNewDivision);
  });

  it("should set parentId to null if not provided", async () => {
    const mockNewDivision = {
      id: 2,
      divisi: "Divisi 2",
      parentId: null,
    };

    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
    };

    mockDivisionRepository.addDivision.mockResolvedValue(mockNewDivision);

    const result = await divisionService.addDivision(addData);

    expect(mockDivisionRepository.addDivision).toHaveBeenCalledWith({
      divisi: "Divisi 2",
      parentId: null,
    });
    expect(result).toEqual(mockNewDivision);
  });

  it("should throw an error if parent divisi not found", async () => {
    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: 99,
    };

    mockDivisionRepository.getDivisionById.mockResolvedValue(null);

    await expect(divisionService.addDivision(addData)).rejects.toThrow(
      "Parent divisi not found",
    );
    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(99);
  });

  it("should handle repository errors gracefully", async () => {
    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: 1,
    };

    mockDivisionRepository.getDivisionById.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(divisionService.addDivision(addData)).rejects.toThrow(
      "Database error",
    );
    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
  });

  it("should handle null parentId explicitly", async () => {
    const mockNewDivision = {
      id: 2,
      divisi: "Divisi 2",
      parentId: null,
    };

    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: null,
    };

    mockDivisionRepository.addDivision.mockResolvedValue(mockNewDivision);

    const result = await divisionService.addDivision(addData);

    expect(mockDivisionRepository.addDivision).toHaveBeenCalledWith(addData);
    expect(result).toEqual(mockNewDivision);
  });

  it("should handle undefined parentId explicitly", async () => {
    const mockNewDivision = {
      id: 2,
      divisi: "Divisi 2",
      parentId: null,
    };

    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: undefined,
    };

    mockDivisionRepository.addDivision.mockResolvedValue(mockNewDivision);

    const result = await divisionService.addDivision(addData);

    expect(mockDivisionRepository.addDivision).toHaveBeenCalledWith({
      divisi: "Divisi 2",
      parentId: null,
    });
    expect(result).toEqual(mockNewDivision);
  });
});
