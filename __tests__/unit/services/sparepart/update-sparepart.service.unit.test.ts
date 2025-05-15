import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartDTO, SparepartsDTO } from "../../../../src/dto/sparepart.dto";

jest.mock("../../../../src/repository/sparepart.repository");

describe("SparepartService - updateSparepart", () => {
  let sparepartService: SparepartService;
  let sparepartRepositoryMock: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    sparepartRepositoryMock = {
      getSparepartById: jest.fn(),
      updateSparepart: jest.fn(),
    } as unknown as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = sparepartRepositoryMock;
  });

  it("should successfully update a sparepart", async () => {
    const mockSparepart: SparepartDTO = {
      id: "test-id",
      partsName: "Original Part",
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

    const updateData: Partial<SparepartsDTO> = {
      partsName: "Updated Part",
      price: 150,
    };

    const updatedSparepart = {
      ...mockSparepart,
      ...updateData,
      modifiedOn: new Date(),
    };

    sparepartRepositoryMock.getSparepartById.mockResolvedValue(mockSparepart);
    sparepartRepositoryMock.updateSparepart.mockResolvedValue(updatedSparepart);

    const result = await sparepartService.updateSparepart(
      "test-id",
      updateData,
    );

    expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith(
      "test-id",
    );
    expect(sparepartRepositoryMock.updateSparepart).toHaveBeenCalledWith(
      "test-id",
      updateData,
    );
    expect(result).toEqual(updatedSparepart);
  });

  it("should throw error if sparepart not found", async () => {
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(null);

    await expect(
      sparepartService.updateSparepart("non-existent-id", {
        partsName: "New Name",
      }),
    ).rejects.toThrow("Sparepart not found");
  });

  it("should throw error if partsName is empty", async () => {
    const mockSparepart: SparepartDTO = {
      id: "test-id",
      partsName: "Original Part",
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

    await expect(
      sparepartService.updateSparepart("test-id", { partsName: "" }),
    ).rejects.toThrow("Parts name cannot be empty");
  });

  it("should throw error if partsName is whitespace", async () => {
    const mockSparepart: SparepartDTO = {
      id: "test-id",
      partsName: "Original Part",
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

    await expect(
      sparepartService.updateSparepart("test-id", { partsName: "   " }),
    ).rejects.toThrow("Parts name cannot be empty");
  });

  it("should throw error if partsName is not a string", async () => {
    const mockSparepart: SparepartDTO = {
      id: "test-id",
      partsName: "Original Part",
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

    await expect(
      sparepartService.updateSparepart("test-id", { partsName: 123 as any }),
    ).rejects.toThrow("data.partsName.trim is not a function");
  });

  it("should throw error if sparepart ID is invalid", async () => {
    await expect(
      sparepartService.updateSparepart("", { partsName: "New Name" }),
    ).rejects.toThrow("Sparepart ID is required and must be a valid string");
  });

  it("should handle repository error", async () => {
    const mockSparepart: SparepartDTO = {
      id: "test-id",
      partsName: "Original Part",
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
    sparepartRepositoryMock.updateSparepart.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(
      sparepartService.updateSparepart("test-id", { partsName: "New Name" }),
    ).rejects.toThrow("Database error");
  });

  it("should successfully update a sparepart with image", async () => {
    const mockSparepart: SparepartDTO = {
      id: "test-id",
      partsName: "Original Part",
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

    const updateData: Partial<SparepartsDTO> = {
      imageUrl: "/uploads/spareparts/new-image.jpg",
    };

    const updatedSparepart = {
      ...mockSparepart,
      ...updateData,
      modifiedOn: new Date(),
    };

    sparepartRepositoryMock.getSparepartById.mockResolvedValue(mockSparepart);
    sparepartRepositoryMock.updateSparepart.mockResolvedValue(updatedSparepart);

    const result = await sparepartService.updateSparepart(
      "test-id",
      updateData,
    );

    expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith(
      "test-id",
    );
    expect(sparepartRepositoryMock.updateSparepart).toHaveBeenCalledWith(
      "test-id",
      updateData,
    );
    expect(result).toEqual(updatedSparepart);
  });

  it("should instantiate SparepartService and repository", () => {
    const service = new SparepartService();
    expect(service).toBeInstanceOf(SparepartService);
    expect((service as any).sparepartRepository).toBeInstanceOf(
      SparepartRepository,
    );
  });
});
