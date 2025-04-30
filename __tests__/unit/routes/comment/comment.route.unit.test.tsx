import { Router } from "express";

// Mock express.Router
jest.mock("express", () => {
  const mockRouter = {
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
jest.mock("../../../../src/controllers/comment.controller", () => {
  return {
    CommentController: jest.fn().mockImplementation(() => ({
      createComment: jest.fn(),
      getAllComments: jest.fn(),
      getCommentsByRequestId: jest.fn(),
    })),
  };
});

// Mock middleware
jest.mock("../../../../src/middleware/verifyToken", () =>
  jest.fn((_req: any, _res: any, next: any) => next()),
);

// Import the route after all mocks are defined
import "../../../../src/routes/comment.route";

describe("Comment Routes", () => {
  it("should create router with Router()", () => {
    expect(Router).toHaveBeenCalled();
  });

  it("should register POST / route with verifyToken middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.post).toHaveBeenCalledWith(
      "/",
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET / route with verifyToken middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/",
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("should register GET /request/:requestId route with verifyToken middleware", () => {
    const mockRouter = (Router as jest.Mock).mock.results[0].value;
    expect(mockRouter.get).toHaveBeenCalledWith(
      "/request/:requestId",
      expect.any(Function),
      expect.any(Function),
    );
  });
});
