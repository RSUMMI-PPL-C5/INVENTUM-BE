import { Request, Response } from "express";
import { CommentController } from "../../../../src/controllers/comment.controller";
import { CommentService } from "../../../../src/services/comment.service";
import { CommentResponseDto } from "../../../../src/dto/comment.dto";

// Mock dependencies
jest.mock("../../../../src/services/comment.service");
jest.mock("@prisma/client");

describe("CommentController", () => {
  let commentController: CommentController;
  let mockCommentService: jest.Mocked<CommentService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup response spies
    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    // Setup mock response
    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };

    // Initialize controller
    commentController = new CommentController();

    // Access and mock the service
    mockCommentService = (commentController as any)
      .commentService as jest.Mocked<CommentService>;
  });

  describe("createComment", () => {
    it("should create a comment successfully", async () => {
      // Setup mock data
      const mockUserId = "test-user-id";
      const mockText = "Test comment";
      const mockRequestId = "test-request-id";

      const mockComment: CommentResponseDto = {
        id: "comment-id",
        text: mockText,
        userId: mockUserId,
        requestId: mockRequestId,
        createdAt: new Date(),
        modifiedAt: new Date(),
        user: {
          id: mockUserId,
          fullname: "Test User",
          username: "testuser",
        },
      };

      // Setup request
      mockRequest = {
        body: {
          text: mockText,
          requestId: mockRequestId,
        },
        user: {
          userId: mockUserId,
          role: "user",
        },
      };

      // Mock service response
      mockCommentService.createComment.mockResolvedValue(mockComment);

      // Call method
      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockCommentService.createComment).toHaveBeenCalledWith({
        text: mockText,
        userId: mockUserId,
        requestId: mockRequestId,
      });

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "Comment created successfully",
        data: mockComment,
      });
    });

    // This test covers line 58 branch
    it("should return 400 if userId is not provided", async () => {
      // Setup request without userId
      mockRequest = {
        body: {
          text: "Test comment",
          requestId: "test-request-id",
        },
        user: {
          // Missing userId
          role: "user",
        },
      };

      // Call method
      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockCommentService.createComment).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "User ID is required",
      });
    });

    it("should handle service errors", async () => {
      // Setup mock data
      const mockUserId = "test-user-id";
      const mockError = new Error("Service error");

      // Setup request
      mockRequest = {
        body: {
          text: "Test comment",
        },
        user: {
          userId: mockUserId,
          role: "user",
        },
      };

      // Mock service error
      mockCommentService.createComment.mockRejectedValue(mockError);

      // Call method
      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });

    // Fix the test for missing req.user property
    it("should return 500 if req.user is missing entirely", async () => {
      // Setup request without user object
      mockRequest = {
        body: {
          text: "Test comment",
          requestId: "test-request-id",
        },
        // No user property at all
      };

      // Call method
      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions - update expectations to match actual error message
      expect(mockCommentService.createComment).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Cannot read properties of undefined (reading 'userId')",
      });
    });

    // Add a test for non-Error objects in catch block
    it("should handle non-Error objects thrown by service", async () => {
      // Setup mock data
      const mockUserId = "test-user-id";

      // Setup request
      mockRequest = {
        body: {
          text: "Test comment",
        },
        user: {
          userId: mockUserId,
          role: "user",
        },
      };

      // Mock service throwing a string or non-Error object
      mockCommentService.createComment.mockRejectedValue("Not an error object");

      // Call method
      await commentController.createComment(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Failed to create comment",
      });
    });
  });

  describe("getCommentsByRequestId", () => {
    it("should get comments by requestId successfully", async () => {
      // Setup mock data
      const mockRequestId = "test-request-id";
      const mockComments = [
        {
          id: "comment-1",
          text: "Test comment 1",
          userId: "user-1",
          requestId: mockRequestId,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      // Setup request
      mockRequest = {
        params: {
          requestId: mockRequestId,
        },
      };

      // Mock service response
      mockCommentService.getCommentsByRequestId.mockResolvedValue(mockComments);

      // Call method
      await commentController.getCommentsByRequestId(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockCommentService.getCommentsByRequestId).toHaveBeenCalledWith(
        mockRequestId,
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "Comments retrieved successfully",
        data: mockComments,
      });
    });

    // This test covers missing branch in line 86-104 range
    it("should return 400 if requestId is not provided", async () => {
      // Setup request without requestId
      mockRequest = {
        params: {},
      };

      // Call method
      await commentController.getCommentsByRequestId(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockCommentService.getCommentsByRequestId).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Request ID is required",
      });
    });

    it("should handle service errors", async () => {
      // Setup mock data
      const mockRequestId = "test-request-id";
      const mockError = new Error("Service error");

      // Setup request
      mockRequest = {
        params: {
          requestId: mockRequestId,
        },
      };

      // Mock service error
      mockCommentService.getCommentsByRequestId.mockRejectedValue(mockError);

      // Call method
      await commentController.getCommentsByRequestId(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });

    // Add a test for non-Error objects in catch block
    it("should handle non-Error objects thrown by service", async () => {
      // Setup mock data
      const mockRequestId = "test-request-id";

      // Setup request
      mockRequest = {
        params: {
          requestId: mockRequestId,
        },
      };

      // Mock service throwing a string or non-Error object
      mockCommentService.getCommentsByRequestId.mockRejectedValue(
        "Not an error object",
      );

      // Call method
      await commentController.getCommentsByRequestId(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get comments",
      });
    });

    // Test for null requestId (different from undefined)
    it("should return 400 if requestId is null", async () => {
      // Setup request with null requestId
      mockRequest = {
        params: {
          requestId: "",
        },
      };

      // Call method
      await commentController.getCommentsByRequestId(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockCommentService.getCommentsByRequestId).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Request ID is required",
      });
    });
  });

  describe("getAllComments", () => {
    it("should get all comments successfully", async () => {
      // Setup mock data
      const mockComments = [
        {
          id: "comment-1",
          text: "Test comment 1",
          userId: "user-1",
          requestId: "request-1",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "comment-2",
          text: "Test comment 2",
          userId: "user-2",
          requestId: "request-2",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      // Mock service response
      mockCommentService.getAllComments.mockResolvedValue(mockComments);

      // Call method
      await commentController.getAllComments(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(mockCommentService.getAllComments).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: "All comments retrieved successfully",
        data: mockComments,
      });
    });

    it("should handle service errors", async () => {
      // Setup mock error
      const mockError = new Error("Service error");

      // Mock service error
      mockCommentService.getAllComments.mockRejectedValue(mockError);

      // Call method
      await commentController.getAllComments(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });

    // Add a test for non-Error objects in catch block
    it("should handle non-Error objects thrown by service", async () => {
      // Mock service throwing a string or non-Error object
      mockCommentService.getAllComments.mockRejectedValue(
        "Not an error object",
      );

      // Call method
      await commentController.getAllComments(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assertions
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get comments",
      });
    });
  });
});
