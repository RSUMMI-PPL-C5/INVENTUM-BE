import { Router } from "express";
import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import verifyToken from "../../../../src/middleware/verifyToken";
import authorizeRoles from "../../../../src/middleware/authorizeRole";
import { validateRequest } from "../../../../src/middleware/validateRequest";
import {
  addSparepartValidation,
  updateSparepartValidation,
  sparepartFilterQueryValidation,
} from "../../../../src/validations/spareparts.validation";

jest.mock("express", () => ({
  Router: jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe("Sparepart Routes", () => {
  let routerInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    require("../../../../src/routes/sparepart.route");
    routerInstance = (Router as jest.Mock)();
  });

  it("should create router with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  it("should use verifyToken and authorizeRoles middleware", () => {
    expect(routerInstance.use).toHaveBeenCalledWith(
      verifyToken,
      authorizeRoles("admin", "user"),
    );
  });

  it("should register GET / route with filter validation", () => {
    expect(routerInstance.get).toHaveBeenCalledWith(
      "/",
      sparepartFilterQueryValidation,
      validateRequest,
      expect.any(Function),
    );
  });

  it("should register GET /:id route", () => {
    expect(routerInstance.get).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
    );
  });

  it("should register POST / route with validation", () => {
    expect(routerInstance.post).toHaveBeenCalledWith(
      "/",
      addSparepartValidation,
      validateRequest,
      expect.any(Function),
    );
  });

  it("should register PUT /:id route with validation", () => {
    expect(routerInstance.put).toHaveBeenCalledWith(
      "/:id",
      updateSparepartValidation,
      validateRequest,
      expect.any(Function),
    );
  });

  it("should register DELETE /:id route", () => {
    expect(routerInstance.delete).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
    );
  });
});

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

  it("should throw error if id is invalid", async () => {
    await expect(
      sparepartService.updateSparepart("", { partsName: "A" }),
    ).rejects.toThrow("Sparepart ID is required and must be a valid string");
  });

  it("should throw error if sparepart not found", async () => {
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(null);
    await expect(
      sparepartService.updateSparepart("id", { partsName: "A" }),
    ).rejects.toThrow("Sparepart not found");
  });

  it("should throw error if partsName is empty", async () => {
    sparepartRepositoryMock.getSparepartById.mockResolvedValue({
      partsName: "   ",
    } as any);
    await expect(
      sparepartService.updateSparepart("id", { partsName: "   " }),
    ).rejects.toThrow("Parts name cannot be empty");
  });
  it("should update sparepart successfully", async () => {
    const mockSparepart = { id: "id", partsName: "A", imageUrl: null } as any;
    const updated = { id: "id", partsName: "B", imageUrl: null } as any;
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(mockSparepart);
    sparepartRepositoryMock.updateSparepart.mockResolvedValue(updated);
    const result = await sparepartService.updateSparepart("id", {
      partsName: "B",
    });
    expect(result).toEqual(updated);
  });
});

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

  it("should throw error if id is invalid", async () => {
    await expect(sparepartService.deleteSparepart("")).rejects.toThrow(
      "Sparepart ID is required and must be a valid string",
    );
  });

  it("should throw error if sparepart not found", async () => {
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(null);
    await expect(sparepartService.deleteSparepart("id")).rejects.toThrow(
      "Sparepart not found",
    );
  });
  it("should delete sparepart successfully", async () => {
    const mockSparepart = { id: "id", partsName: "A", imageUrl: null } as any;
    const deleted = {
      id: "id",
      partsName: "A",
      deletedOn: new Date(),
      imageUrl: null,
    } as any;
    sparepartRepositoryMock.getSparepartById.mockResolvedValue(mockSparepart);
    sparepartRepositoryMock.deleteSparepart.mockResolvedValue(deleted);
    const result = await sparepartService.deleteSparepart("id");
    expect(result).toEqual(deleted);
  });
});
