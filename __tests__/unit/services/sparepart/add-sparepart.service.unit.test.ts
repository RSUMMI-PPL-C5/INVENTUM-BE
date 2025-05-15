import { v4 as uuidv4 } from "uuid";
import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import { SparepartDTO, SparepartsDTO } from "../../../../src/dto/sparepart.dto";
import AppError from "../../../../src/utils/appError";
import { PaginationOptions } from "../../../../src/interfaces/pagination.interface";
import { SparepartFilterOptions } from "../../../../src/interfaces/spareparts.filter.interface";

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
    const mockSparepartData: SparepartsDTO = {
      id: "mock-id",
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

    const mockCreatedSparepart = {
      ...mockSparepartData,
      id: "generated-uuid",
    } as SparepartDTO;

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
      toolDate: "2024-03-20",
      imageUrl: null,
      createdBy: "user123",
      createdOn: mockSparepartData.createdOn,
      modifiedBy: null,
      modifiedOn: mockSparepartData.modifiedOn,
      deletedBy: null,
      deletedOn: null,
    });
    expect(result).toEqual(mockCreatedSparepart);
  });

  it("should throw error if partsName is missing", async () => {
    const invalidData = {
      id: "mock-id",
      price: 100,
      createdBy: "user123",
      purchaseDate: null,
      createdOn: new Date(),
      modifiedOn: new Date(),
      toolLocation: null,
      toolDate: null,
      imageUrl: null,
      modifiedBy: null,
      deletedBy: null,
      deletedOn: null,
    } as SparepartsDTO;

    await expect(sparepartService.addSparepart(invalidData)).rejects.toThrow(
      "Parts name is required and must be a valid string",
    );
  });

  it("should throw error if partsName is empty string", async () => {
    const invalidData = {
      id: "mock-id",
      partsName: "",
      price: 100,
      createdBy: "user123",
      purchaseDate: null,
      createdOn: new Date(),
      modifiedOn: new Date(),
      toolLocation: null,
      toolDate: null,
      imageUrl: null,
      modifiedBy: null,
      deletedBy: null,
      deletedOn: null,
    } as SparepartsDTO;

    await expect(sparepartService.addSparepart(invalidData)).rejects.toThrow(
      "Parts name is required and must be a valid string",
    );
  });

  it("should throw error if partsName is whitespace", async () => {
    const invalidData = {
      id: "mock-id",
      partsName: "   ",
      price: 100,
      createdBy: "user123",
      purchaseDate: null,
      createdOn: new Date(),
      modifiedOn: new Date(),
      toolLocation: null,
      toolDate: null,
      imageUrl: null,
      modifiedBy: null,
      deletedBy: null,
      deletedOn: null,
    } as SparepartsDTO;

    await expect(sparepartService.addSparepart(invalidData)).rejects.toThrow(
      "Parts name is required and must be a valid string",
    );
  });

  it("should throw error if partsName is not a string", async () => {
    const invalidData = {
      id: "mock-id",
      partsName: 123 as any,
      price: 100,
      createdBy: "user123",
      purchaseDate: null,
      createdOn: new Date(),
      modifiedOn: new Date(),
      toolLocation: null,
      toolDate: null,
      imageUrl: null,
      modifiedBy: null,
      deletedBy: null,
      deletedOn: null,
    } as SparepartsDTO;

    await expect(sparepartService.addSparepart(invalidData)).rejects.toThrow(
      "Parts name is required and must be a valid string",
    );
  });

  it("should handle repository error", async () => {
    const validData: SparepartsDTO = {
      id: "mock-id",
      partsName: "Test Part",
      price: 100,
      createdBy: "user123",
      createdOn: new Date(),
      modifiedOn: new Date(),
      purchaseDate: new Date(),
      toolLocation: "Location A",
      toolDate: "2024-03-20",
      imageUrl: null,
      modifiedBy: null,
      deletedBy: null,
      deletedOn: null,
    };

    sparepartRepositoryMock.createSparepart.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(sparepartService.addSparepart(validData)).rejects.toThrow(
      "Database error",
    );
  });

  it("should successfully add a sparepart with image", async () => {
    const mockSparepartData: SparepartsDTO = {
      id: "mock-id",
      partsName: "Test Part",
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Warehouse A",
      toolDate: "2024-03-20",
      imageUrl: "/uploads/spareparts/test.jpg",
      createdBy: "user123",
      createdOn: new Date(),
      modifiedBy: null,
      modifiedOn: new Date(),
      deletedBy: null,
      deletedOn: null,
    };

    const mockCreatedSparepart = {
      ...mockSparepartData,
      id: "generated-uuid",
    } as SparepartDTO;

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
      toolDate: "2024-03-20",
      imageUrl: "/uploads/spareparts/test.jpg",
      createdBy: "user123",
      createdOn: mockSparepartData.createdOn,
      modifiedBy: null,
      modifiedOn: mockSparepartData.modifiedOn,
      deletedBy: null,
      deletedOn: null,
    });
    expect(result).toEqual(mockCreatedSparepart);
  });

  it("should throw an error if partsName is null", async () => {
    const invalidData = {
      id: "mock-id",
      partsName: null as any,
      createdBy: "user123",
      purchaseDate: null,
      createdOn: new Date(),
      modifiedOn: new Date(),
      toolLocation: null,
      toolDate: null,
      imageUrl: null,
      modifiedBy: null,
      deletedBy: null,
      deletedOn: null,
    } as SparepartsDTO;

    await expect(sparepartService.addSparepart(invalidData)).rejects.toThrow(
      "Parts name is required and must be a valid string",
    );
  });

  it("should throw an error if partsName is undefined", async () => {
    const invalidData = {
      id: "mock-id",
      partsName: undefined as any,
      createdBy: "user123",
      purchaseDate: null,
      createdOn: new Date(),
      modifiedOn: new Date(),
      toolLocation: null,
      toolDate: null,
      imageUrl: null,
      modifiedBy: null,
      deletedBy: null,
      deletedOn: null,
    } as SparepartsDTO;

    await expect(sparepartService.addSparepart(invalidData)).rejects.toThrow(
      "Parts name is required and must be a valid string",
    );
  });

  it("should successfully create a sparepart with minimal required fields", async () => {
    const minimalData: SparepartsDTO = {
      id: "mock-id",
      partsName: "Test Part",
      createdBy: "user123",
      createdOn: new Date(),
      modifiedOn: new Date(),
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Location A",
      toolDate: "2024-03-20",
      imageUrl: null,
      modifiedBy: null,
      deletedBy: null,
      deletedOn: null,
    };

    const expectedResponse = {
      ...minimalData,
      id: "generated-uuid",
    } as SparepartDTO;

    (uuidv4 as jest.Mock).mockReturnValue("generated-uuid");
    sparepartRepositoryMock.createSparepart.mockResolvedValue(expectedResponse);

    const result = await sparepartService.addSparepart(minimalData);
    expect(result).toEqual(expectedResponse);
    expect(sparepartRepositoryMock.createSparepart).toHaveBeenCalledWith({
      ...minimalData,
      id: "generated-uuid",
    });
  });

  it("should successfully create a sparepart with all fields", async () => {
    const completeData: SparepartsDTO = {
      id: "mock-id",
      partsName: "Test Part",
      createdBy: "user123",
      createdOn: new Date(),
      modifiedOn: new Date(),
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Location A",
      toolDate: "2024-03-20",
      imageUrl: "image.jpg",
    };

    const expectedResponse = {
      ...completeData,
      id: expect.any(String),
    };

    sparepartRepositoryMock.createSparepart.mockResolvedValue(expectedResponse);

    const result = await sparepartService.addSparepart(completeData);
    expect(result).toEqual(expectedResponse);
    expect(sparepartRepositoryMock.createSparepart).toHaveBeenCalledWith({
      ...completeData,
      id: expect.any(String),
    });
  });

  it("should generate a new UUID for the sparepart", async () => {
    const data: SparepartsDTO = {
      id: "mock-id",
      partsName: "Test Part",
      createdBy: "user123",
      modifiedOn: new Date(),
    };

    const expectedResponse = {
      ...data,
      id: "generated-uuid",
      createdOn: new Date(),
    };

    sparepartRepositoryMock.createSparepart.mockResolvedValue(expectedResponse);

    const result = await sparepartService.addSparepart(data);
    expect(result).toEqual(expectedResponse);
    expect(sparepartRepositoryMock.createSparepart).toHaveBeenCalledWith({
      ...data,
      id: expect.any(String),
    });
  });

  it("should instantiate SparepartService and repository", () => {
    const service = new SparepartService();
    expect(service).toBeInstanceOf(SparepartService);
    expect((service as any).sparepartRepository).toBeInstanceOf(
      SparepartRepository,
    );
  });
});
