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
    const mockDivisi = {
      id: 2,
      divisi: "Divisi 2",
      parentId: 1,
    };

    const addData: Partial<DivisiDTO> = {
      divisi: "Divisi 2",
      parentId: 1,
    };

    mockDivisiRepository.addDivisi.mockResolvedValue(mockDivisi);

    const result = await divisiService.addDivisi(addData);

    expect(mockDivisiRepository.addDivisi).toHaveBeenCalledWith(addData);
    expect(result).toEqual(mockDivisi);
  });
});