import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import AppError from "../../../../src/utils/appError";
import { SparepartDTO, SparepartsDTO } from "../../../../src/dto/sparepart.dto";

jest.mock("../../../../src/repository/sparepart.repository");

describe("SparepartService - updateSparepart", () => {
  let sparepartService: SparepartService;
  let sparepartRepositoryMock: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    sparepartRepositoryMock =
      new SparepartRepository() as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = sparepartRepositoryMock;
  });

  const baseSparepart: SparepartDTO = {
    id: "1",
    partsName: "Original Part",
    purchaseDate: null,
    price: 100,
    toolLocation: "Warehouse A",
    toolDate: null,
    createdBy: "user123",
    createdOn: new Date("2023-01-01"),
    modifiedBy: null,
    modifiedOn: new Date("2023-01-01"),
    deletedBy: null,
    deletedOn: null,
  };

  it("should successfully update a sparepart", async () => {
    const updatedData: Partial<SparepartsDTO> = {
      partsName: "Updated Part",
      price: 150,
      modifiedBy: "user456",
    };

    const updatedSparepart: SparepartsDTO = {
      ...baseSparepart,
      partsName: "Updated Part",
      price: 150,
      modifiedBy: "user456",
      modifiedOn: new Date(),
      purchaseDate: baseSparepart.purchaseDate,
    };

    sparepartRepositoryMock.getSparepartById.mockResolvedValue(baseSparepart);
    sparepartRepositoryMock.updateSparepart.mockResolvedValue(updatedSparepart);

    const result = await sparepartService.updateSparepart("1", updatedData);

    expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith("1");
    expect(sparepartRepositoryMock.updateSparepart).toHaveBeenCalledWith("1", {
      partsName: "Updated Part",
      price: 150,
      modifiedBy: "user456",
    });
    expect(result).toEqual(updatedSparepart);
  });

  it("should throw an error if sparepart is not found", async () => {
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(null);

    await expect(
      sparepartService.updateSparepart("999", { partsName: "Updated Part" }),
    ).rejects.toThrow(new AppError("Sparepart not found", 404));

    expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith(
      "999",
    );
    expect(sparepartRepositoryMock.updateSparepart).not.toHaveBeenCalled();
  });

  it("should throw an error if partsName is empty", async () => {
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(baseSparepart);

    await expect(
      sparepartService.updateSparepart("1", { partsName: "   " }),
    ).rejects.toThrow(new AppError("Parts name cannot be empty", 400));

    expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith("1");
    expect(sparepartRepositoryMock.updateSparepart).not.toHaveBeenCalled();
  });

  it("should throw an error if ID is invalid", async () => {
    await expect(
      sparepartService.updateSparepart("", { partsName: "Updated Part" }),
    ).rejects.toThrow(
      new AppError("Sparepart ID is required and must be a valid string", 400),
    );

    expect(sparepartRepositoryMock.getSparepartById).not.toHaveBeenCalled();
    expect(sparepartRepositoryMock.updateSparepart).not.toHaveBeenCalled();
  });
});
