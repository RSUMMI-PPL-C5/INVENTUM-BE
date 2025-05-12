import { Router } from "express";
import SparepartService from "../../../../src/services/sparepart.service";
import SparepartRepository from "../../../../src/repository/sparepart.repository";

// Mock express.Router
jest.mock("express", () => {
  const mockRouter = {
    use: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  return {
    Router: jest.fn(() => mockRouter),
  };
});

// Mock controller
jest.mock("../../../../src/controllers/sparepart.controller", () => {
  return jest.fn().mockImplementation(() => ({
    getSpareparts: jest.fn(),
    getSparepartById: jest.fn(),
    addSparepart: jest.fn(),
    updateSparepart: jest.fn(),
    deleteSparepart: jest.fn(),
  }));
});

// Mock middleware with explicit any types and unused args as _
jest.mock("../../../../src/middleware/verifyToken", () =>
  jest.fn((_req: any, _res: any, next: any) => next()),
);

jest.mock("../../../../src/middleware/authorizeRole", () =>
  jest.fn(() => (_req: any, _res: any, next: any) => next()),
);

jest.mock("../../../../src/validations/spareparts.validation", () => ({
  addSparepartValidation: jest.fn((_req: any, _res: any, next: any) => next()),
  updateSparepartValidation: jest.fn((_req: any, _res: any, next: any) =>
    next(),
  ),
  sparepartFilterQueryValidation: jest.fn((_req: any, _res: any, next: any) =>
    next(),
  ),
}));

jest.mock("../../../../src/middleware/validateRequest", () => ({
  validateRequest: jest.fn((_req: any, _res: any, next: any) => next()),
}));

// Mock multer
jest.mock("multer", () => {
  const multer = () => {
    return {
      single: () => {
        return (req: any, res: any, next: any) => next();
      },
    };
  };
  multer.diskStorage = jest.fn().mockReturnValue({
    destination: (req: any, file: any, cb: any) => {
      cb(null, "uploads/spareparts");
    },
    filename: (req: any, file: any, cb: any) => {
      cb(
        null,
        `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`,
      );
    },
  });
  return multer;
});

// Import the route after all mocks
import "../../../../src/routes/sparepart.route";

describe("Sparepart Routes", () => {
  it("should create router with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  it("should use verifyToken and authorizeRoles middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET / route with filter validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET /:id route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith("/:id", expect.any(Function));
  });

  it("should register POST / route with multer and validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.post).toHaveBeenCalledWith(
      "/",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register PUT /:id route with multer and validation", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.put).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register DELETE /:id route", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.delete).toHaveBeenCalledWith(
      "/:id",
      expect.any(Function),
    );
  });

  it("should configure multer storage correctly", () => {
    const multer = require("multer");
    expect(multer.diskStorage).toHaveBeenCalled();
    const storageConfig = multer.diskStorage.mock.calls[0][0];

    // Test destination function
    const mockReq = {} as Request;
    const mockFile = {} as Express.Multer.File;
    const mockCb = jest.fn();

    storageConfig.destination(mockReq, mockFile, mockCb);
    expect(mockCb).toHaveBeenCalledWith(
      null,
      expect.stringMatching(/[\\\/]uploads[\\\/]spareparts$/),
    );

    // Test filename function
    storageConfig.filename(mockReq, mockFile, mockCb);
    expect(mockCb).toHaveBeenCalledWith(
      null,
      expect.stringMatching(/^\d+-\d+-.+$/),
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
