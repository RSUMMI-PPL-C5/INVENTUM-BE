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
    mockDivisionRepository = new DivisionRepository() as jest.Mocked<DivisionRepository>;
    divisionService = new DivisionService();
    (divisionService as any).divisionRepository = mockDivisionRepository;
  });

  it("should add a new divisi", async () => {
    const mockNewDivision = {
      id: 2,
      divisi: "Divisi 2",
      parentId: 1,
    };

    const mockParentDivision: DivisionDTO = {
      id: 1,
      divisi: 'Divisi 1',
      parentId: null,
    };

    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: 1,
    };

    mockDivisionRepository.getDivisionById.mockResolvedValue(mockParentDivision);
    mockDivisionRepository.addDivision.mockResolvedValue(mockNewDivision);

    const result = await divisionService.addDivision(addData);

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.addDivision).toHaveBeenCalledWith(addData);
    expect(result).toEqual(mockNewDivision);
  });

  it("should use default parentId if not provided", async () => {
    const mockNewDivision = {
      id: 2,
      divisi: "Divisi 2",
      parentId: 1,
    };

    const mockParentDivision: DivisionDTO = {
      id: 59,
      divisi: 'Divisi 1',
      parentId: null,
    };

    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
    };

    mockDivisionRepository.getDivisionById.mockResolvedValue(mockParentDivision);
    mockDivisionRepository.addDivision.mockResolvedValue(mockNewDivision);

    const result = await divisionService.addDivision(addData);

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(59);
    expect(mockDivisionRepository.addDivision).toHaveBeenCalledWith({ ...addData, parentId: 59 });
    expect(result).toEqual(mockNewDivision);
  });

  it("should throw an error if parent divisi not found", async () => {
    const addData: Partial<DivisionDTO> = {
      divisi: "Divisi 2",
      parentId: 99,
    };

    mockDivisionRepository.getDivisionById.mockResolvedValue(null);

    await expect(divisionService.addDivision(addData)).rejects.toThrow("Parent divisi not found");
  });
});