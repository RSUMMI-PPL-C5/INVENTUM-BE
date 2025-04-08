// __tests__/unit/controllers/sparepart/get-spareparts.controller.unit.test.ts
import { Request, Response } from "express";
import SparepartController from "../../../../src/controllers/sparepart.controller";
import SparepartService from "../../../../src/services/sparepart.service";

// Mock the SparepartService
jest.mock("../../../../src/services/sparepart.service");

describe("SparepartController - READ", () => {
  let sparepartController: SparepartController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockSparepartService: jest.Mocked<SparepartService>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock response with jest spy functions
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Setup mock request with empty query object
    mockRequest = {
      query: {},
    };

    // Setup mock service
    mockSparepartService =
      new SparepartService() as jest.Mocked<SparepartService>;

    // Create controller instance with mocked service
    sparepartController = new SparepartController();
    // Replace the service with our mock
    (sparepartController as any).sparepartService = mockSparepartService;
  });

  it("should return all spareparts with status 200", async () => {
    // Mock data to be returned by service
    const mockSpareparts = [
      {
        id: "1",
        partsName: "Test Part 1",
        purchaseDate: new Date(),
        price: 100,
        toolLocation: "Location 1",
        toolDate: "2025-03-24",
      },
      {
        id: "2",
        partsName: "Test Part 2",
        purchaseDate: new Date(),
        price: 200,
        toolLocation: "Location 2",
        toolDate: "2025-03-24",
      },
    ];

    // Setup the mock to return our test data
    mockSparepartService.getSpareparts = jest
      .fn()
      .mockResolvedValue(mockSpareparts);

    // Call the controller method
    await sparepartController.getSpareparts(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Verify the service was called
    expect(mockSparepartService.getSpareparts).toHaveBeenCalled();

    // Verify response was as expected
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockSpareparts);
  });

  it("should handle errors and return status 500", async () => {
    // Setup the mock to throw an error
    const errorMessage = "Test error";
    mockSparepartService.getSpareparts = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    // Make sure the controller doesn't try to destructure query params before error is thrown
    mockSparepartService.getFilteredSpareparts = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    // Call the controller method
    await sparepartController.getSpareparts(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Verify error handling
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

// Test for getting a sparepart by ID
describe("SparepartController - getSparepartById", () => {
  let sparepartController: SparepartController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockSparepartService: jest.Mocked<SparepartService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      params: {
        id: "1",
      },
    };

    mockSparepartService =
      new SparepartService() as jest.Mocked<SparepartService>;
    sparepartController = new SparepartController();
    (sparepartController as any).sparepartService = mockSparepartService;
  });

  it("should return a sparepart by ID with status 200", async () => {
    const mockSparepart = {
      id: "1",
      partsName: "Test Part 1",
      purchaseDate: new Date(),
      price: 100,
      toolLocation: "Location 1",
      toolDate: "2025-03-24",
    };

    mockSparepartService.getSparepartById = jest
      .fn()
      .mockResolvedValue(mockSparepart);

    await sparepartController.getSparepartById(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockSparepartService.getSparepartById).toHaveBeenCalledWith("1");
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockSparepart);
  });

  it("should return 404 if sparepart not found", async () => {
    mockSparepartService.getSparepartById = jest.fn().mockResolvedValue(null);

    await sparepartController.getSparepartById(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockSparepartService.getSparepartById).toHaveBeenCalledWith("1");
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Sparepart not found",
    });
  });

  it("should handle errors and return status 500", async () => {
    const errorMessage = "Test error";
    mockSparepartService.getSparepartById = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    await sparepartController.getSparepartById(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});
