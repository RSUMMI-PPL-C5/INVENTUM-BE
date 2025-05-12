import { Router } from "express";

// Mock express.Router
jest.mock("express", () => {
  const mockRouter = {
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    use: jest.fn().mockReturnThis(),
  };
  return {
    Router: jest.fn(() => mockRouter),
  };
});

// Mock controller
jest.mock("../../../../src/controllers/comment.controller", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      createComment: jest.fn(),
      getAllComments: jest.fn(),
      getCommentsByRequestId: jest.fn(),
    })),
  };
});

// Mock middleware
jest.mock("../../../../src/middleware/verifyToken", () =>
  jest.fn(() => jest.fn((_req: any, _res: any, next: any) => next())),
);
jest.mock("../../../../src/middleware/authorizeRole", () =>
  jest.fn(() => jest.fn((_req: any, _res: any, next: any) => next())),
);

// Import the route after all mocks are defined
import "../../../../src/routes/comment.route";

describe("Comment Routes", () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = (Router as jest.Mock).mock.results[0].value;
  });

  it("should create router with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  it("should apply verifyToken and authorizeRoles middleware globally", () => {
    expect(mockRouter.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET / route with verifyToken middleware", () => {
    expect(mockRouter.get).toHaveBeenCalledWith("/", expect.any(Function));
  });
});
