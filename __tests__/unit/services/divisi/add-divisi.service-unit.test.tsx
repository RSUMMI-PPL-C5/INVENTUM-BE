import { DivisiDTO } from "../../../../src/dto/divisi.dto";
import { IDivisiService } from "../../../../src/services/interface/divisi.service.interface";
import DivisiRepository from "../../../../src/repository/divisi.repository";
import DivisiService from "../../../../src/services/divisi.service";

jest.mock("../../../../src/repository/divisi.repository");

describe("DivisiService - ADD", () => {
  let divisiService: IDivisiService;
  let mockDivisiRepository: jest.Mocked<DivisiRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDivisiRepository = new DivisiRepository() as jest.Mocked<DivisiRepository>;
    divisiService = new DivisiService();
    (divisiService as any).divisiRepository = mockDivisiRepository;
  });

  it("should add a new divisi", async () => {
    const mockNewDivisi = {
      id: 2,
      divisi: "Divisi 2",
      parentId: 1,
    };

    const mockParentDivisi: DivisiDTO = {
      id: 1,
      divisi: 'Divisi 1',
      parentId: null,
    };

    const addData: Partial<DivisiDTO> = {
      divisi: "Divisi 2",
      parentId: 1,
    };

    mockDivisiRepository.getDivisiById.mockResolvedValue(mockParentDivisi);
    mockDivisiRepository.addDivisi.mockResolvedValue(mockNewDivisi);

    const result = await divisiService.addDivisi(addData);

    expect(mockDivisiRepository.getDivisiById).toHaveBeenCalledWith(1);
    expect(mockDivisiRepository.addDivisi).toHaveBeenCalledWith(addData);
    expect(result).toEqual(mockNewDivisi);
  });

  it("should use default parentId if not provided", async () => {
    const mockNewDivisi = {
      id: 2,
      divisi: "Divisi 2",
      parentId: 1,
    };

    const mockParentDivisi: DivisiDTO = {
      id: 1,
      divisi: 'Divisi 1',
      parentId: null,
    };

    const addData: Partial<DivisiDTO> = {
      divisi: "Divisi 2",
    };

    mockDivisiRepository.getDivisiById.mockResolvedValue(mockParentDivisi);
    mockDivisiRepository.addDivisi.mockResolvedValue(mockNewDivisi);

    const result = await divisiService.addDivisi(addData);

    expect(mockDivisiRepository.getDivisiById).toHaveBeenCalledWith(1);
    expect(mockDivisiRepository.addDivisi).toHaveBeenCalledWith({ ...addData, parentId: 1 });
    expect(result).toEqual(mockNewDivisi);
  });

  it("should throw an error if parent divisi not found", async () => {
    const addData: Partial<DivisiDTO> = {
      divisi: "Divisi 2",
      parentId: 99,
    };

    mockDivisiRepository.getDivisiById.mockResolvedValue(null);

    await expect(divisiService.addDivisi(addData)).rejects.toThrow("Parent divisi not found");
  });
});