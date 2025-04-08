import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartsDTO } from "../../../../src/dto/sparepart.dto";
import { v4 as uuidv4 } from "uuid";

jest.mock("../../../../src/repository/sparepart.repository");
jest.mock("uuid");

describe("SparepartService - ADD", () => {
  let sparepartService: SparepartService;
  let mockSparepartRepository: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSparepartRepository =
      new SparepartRepository() as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = mockSparepartRepository;
    (uuidv4 as jest.Mock).mockReturnValue("mock-uuid");
  });

  it("should add a new sparepart successfully", async () => {
    const mockSparepartData: Partial<SparepartsDTO> = {
      partsName: "Test Part",
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: new Date().toISOString(),
      createdBy: 1,
    };

    const expectedCreateData: SparepartsDTO = {
      id: "mock-uuid",
      partsName: mockSparepartData.partsName!,
      purchaseDate: mockSparepartData.purchaseDate,
      price: mockSparepartData.price,
      toolLocation: mockSparepartData.toolLocation,
      toolDate: mockSparepartData.toolDate,
      createdBy: mockSparepartData.createdBy!,
      createdOn: expect.any(Date),
      modifiedOn: expect.any(Date),
    };

    mockSparepartRepository.createSparepart.mockResolvedValue(
      expectedCreateData,
    );

    const result = await sparepartService.addSparepart(
      mockSparepartData as SparepartsDTO,
    );

    expect(uuidv4).toHaveBeenCalled();
    expect(mockSparepartRepository.createSparepart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "mock-uuid",
        partsName: mockSparepartData.partsName,
        purchaseDate: mockSparepartData.purchaseDate,
        price: mockSparepartData.price,
        toolLocation: mockSparepartData.toolLocation,
        toolDate: mockSparepartData.toolDate,
        createdBy: mockSparepartData.createdBy,
        createdOn: expect.any(Date),
        modifiedOn: expect.any(Date),
      }),
    );
    expect(result).toEqual(expectedCreateData);
  });

  it("should handle errors when creating a sparepart", async () => {
    const mockSparepartData: Partial<SparepartsDTO> = {
      partsName: "Test Part",
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: new Date().toISOString(),
      createdBy: 1,
    };

    const errorMessage = "Database error";
    mockSparepartRepository.createSparepart.mockRejectedValue(
      new Error(errorMessage),
    );

    await expect(
      sparepartService.addSparepart(mockSparepartData as SparepartsDTO),
    ).rejects.toThrow(errorMessage);
    expect(mockSparepartRepository.createSparepart).toHaveBeenCalled();
  });
});
