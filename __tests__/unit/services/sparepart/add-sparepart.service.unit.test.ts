import { v4 as uuidv4 } from "uuid";
import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";
import AppError from "../../../../src/utils/appError";

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

describe("SparepartService - addSparepart", () => {
  let sparepartService: SparepartService;
  let sparepartRepositoryMock: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    sparepartRepositoryMock = {
      createSparepart: jest.fn(),
    } as unknown as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = sparepartRepositoryMock;
  });

  it("should successfully add a sparepart", async () => {
    const mockSparepartData: SparepartDTO = {
      id: "mock-id",
      partsName: "Test Part",
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: null,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    const mockCreatedSparepart = { ...mockSparepartData, id: "generated-uuid" };
    (uuidv4 as jest.Mock).mockReturnValue("generated-uuid");
    sparepartRepositoryMock.createSparepart.mockResolvedValue(
      mockCreatedSparepart,
    );

    const result = await sparepartService.addSparepart(mockSparepartData);

    expect(uuidv4).toHaveBeenCalled();
    expect(sparepartRepositoryMock.createSparepart).toHaveBeenCalledWith({
      id: "generated-uuid",
      partsName: "Test Part",
      purchaseDate: mockSparepartData.purchaseDate,
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: null,
      createdBy: "user123",
      createdOn: mockSparepartData.createdOn,
      modifiedBy: null,
      modifiedOn: mockSparepartData.modifiedOn,
      deletedBy: null,
      deletedOn: null,
    });
    expect(result).toEqual(mockCreatedSparepart);
  });

  it("should throw an error if partsName is missing", async () => {
    const invalidData: Partial<SparepartDTO> = {
      price: 100,
      createdBy: "user123",
    };

    await expect(
      sparepartService.addSparepart(invalidData as SparepartDTO),
    ).rejects.toThrow(
      new AppError("Parts name is required and must be a valid string", 400),
    );
  });

  it("should throw an error if partsName is an empty string", async () => {
    const invalidData: SparepartDTO = {
      id: "mock-id",
      partsName: "   ",
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: null,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    await expect(sparepartService.addSparepart(invalidData)).rejects.toThrow(
      new AppError("Parts name is required and must be a valid string", 400),
    );
  });
});
