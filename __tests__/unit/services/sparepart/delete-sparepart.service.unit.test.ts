import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import AppError from "../../../../src/utils/appError";
import { SparepartDTO } from "../../../../src/dto/sparepart.dto";

jest.mock("../../../../src/repository/sparepart.repository");

describe("SparepartService - deleteSparepart", () => {
  let sparepartService: SparepartService;
  let sparepartRepositoryMock: jest.Mocked<SparepartRepository>;

  beforeEach(() => {
    sparepartRepositoryMock =
      new SparepartRepository() as jest.Mocked<SparepartRepository>;
    sparepartService = new SparepartService();
    (sparepartService as any).sparepartRepository = sparepartRepositoryMock;
  });

  it("should successfully delete a sparepart", async () => {
    const mockSparepart: SparepartDTO = {
      id: "mock-id",
      partsName: "Test Part",
      purchaseDate: null,
      price: null,
      toolLocation: null,
      toolDate: null,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    sparepartRepositoryMock.getSparepartById.mockResolvedValue(mockSparepart);
    sparepartRepositoryMock.deleteSparepart.mockResolvedValue({
      ...mockSparepart,
      deletedOn: new Date(),
      deletedBy: "user123",
      createdBy: "user123",
      modifiedOn: new Date(),
    });

    const result = await sparepartService.deleteSparepart("mock-id", "user123");

    expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith(
      "mock-id",
    );
    expect(sparepartRepositoryMock.deleteSparepart).toHaveBeenCalledWith(
      "mock-id",
      "user123",
    );
    expect(result).toEqual({
      ...mockSparepart,
      deletedOn: expect.any(Date),
      deletedBy: "user123",
    });
  });

  it("should throw an error if ID is invalid", async () => {
    await expect(
      sparepartService.deleteSparepart("", "user123"),
    ).rejects.toThrow(
      new AppError("Sparepart ID is required and must be a valid string", 400),
    );
  });

  it("should throw an error if sparepart is not found", async () => {
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(null);

    await expect(
      sparepartService.deleteSparepart("non-existent-id", "user123"),
    ).rejects.toThrow(new AppError("Sparepart not found", 404));

    expect(sparepartRepositoryMock.getSparepartById).toHaveBeenCalledWith(
      "non-existent-id",
    );
  });
});
