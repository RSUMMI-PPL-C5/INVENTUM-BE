import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";

describe("SparepartService - deleteSparepart", () => {
  let sparepartService: SparepartService;
  let sparepartRepositoryMock: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    sparepartRepositoryMock = {
      getSparepartById: jest.fn(),
      deleteSparepart: jest.fn(),
    } as unknown as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = sparepartRepositoryMock;
  });

  it("should successfully delete a sparepart", async () => {
    const mockSparepart: SparepartDTO = {
      id: "test-id",
      partsName: "Test Part",
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: "2024-03-20",
      imageUrl: null,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    sparepartRepositoryMock.getSparepartById.mockResolvedValue(mockSparepart);
    sparepartRepositoryMock.deleteSparepart.mockResolvedValue(mockSparepart);

    const result = await sparepartService.deleteSparepart("test-id");

    expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith(
      "test-id",
    );
    expect(sparepartRepositoryMock.deleteSparepart).toHaveBeenCalledWith(
      "test-id",
      undefined,
    );
    expect(result).toEqual(mockSparepart);
  });

  it("should throw error if sparepart not found", async () => {
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(null);

    await expect(
      sparepartService.deleteSparepart("non-existent-id"),
    ).rejects.toThrow("Sparepart not found");
  });

  it("should throw error if sparepart ID is invalid", async () => {
    await expect(sparepartService.deleteSparepart("")).rejects.toThrow(
      "Sparepart ID is required and must be a valid string",
    );
  });

  it("should handle repository error", async () => {
    const mockSparepart: SparepartDTO = {
      id: "test-id",
      partsName: "Test Part",
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: "2024-03-20",
      imageUrl: null,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    sparepartRepositoryMock.getSparepartById.mockResolvedValue(mockSparepart);
    sparepartRepositoryMock.deleteSparepart.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(sparepartService.deleteSparepart("test-id")).rejects.toThrow(
      "Database error",
    );
  });

  it("should instantiate SparepartService and repository", () => {
    const service = new SparepartService();
    expect(service).toBeInstanceOf(SparepartService);
    expect((service as any).sparepartRepository).toBeInstanceOf(
      SparepartRepository,
    );
  });
});
