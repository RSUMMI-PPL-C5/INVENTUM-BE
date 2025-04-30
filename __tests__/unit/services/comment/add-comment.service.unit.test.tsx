import CommentService from "../../../../src/services/comment.service";
import CommentRepository from "../../../../src/repository/comment.repository";
import { CreateCommentDto } from "../../../../src/dto/comment.dto";

// Mock the repository
jest.mock("../../../../src/repository/comment.repository");

describe("CommentService", () => {
  let commentService: CommentService;
  let mockCommentRepository: jest.Mocked<CommentRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock repository instance
    mockCommentRepository =
      new CommentRepository() as jest.Mocked<CommentRepository>;

    // Mock the constructor to return our mock repository
    (CommentRepository as jest.Mock).mockImplementation(
      () => mockCommentRepository,
    );

    // Initialize the service with mock Prisma instance
    commentService = new CommentService();
  });

  describe("createComment", () => {
    it("should successfully create a comment", async () => {
      // Mock data
      const commentData: CreateCommentDto = {
        text: "Test comment",
        userId: "user-123",
        requestId: "request-123",
      };

      // Use any to bypass type checking for the mock response
      const mockResponse: any = {
        id: "comment-123",
        text: "Test comment",
      };

      // Mock repository method
      mockCommentRepository.createComment.mockResolvedValue(mockResponse);

      // Call service method
      const result = await commentService.createComment(commentData);

      // Only test that the repository was called with the right data
      expect(mockCommentRepository.createComment).toHaveBeenCalledWith(
        commentData,
      );
      // And that the service returns what the repository returns
      expect(result).toBe(mockResponse);
    });

    it("should throw an error if repository fails", async () => {
      // Mock data
      const commentData = {
        text: "Test comment",
        userId: "user-123",
        requestId: "request-123",
      };

      // Mock repository error
      mockCommentRepository.createComment.mockRejectedValue(
        new Error("Repository error"),
      );

      // Assertions
      await expect(commentService.createComment(commentData)).rejects.toThrow(
        "Failed to create comment",
      );
      expect(mockCommentRepository.createComment).toHaveBeenCalledWith(
        commentData,
      );
    });
  });

  describe("getCommentsByRequestId", () => {
    it("should successfully get comments by requestId", async () => {
      // Mock data
      const requestId = "request-123";

      // Use any to bypass type checking
      const mockResponse: any = [{ id: "comment-1", text: "Comment 1" }];

      // Mock repository method
      mockCommentRepository.getCommentsByRequestId.mockResolvedValue(
        mockResponse,
      );

      // Call service method
      const result = await commentService.getCommentsByRequestId(requestId);

      // Assertions - focus on behavior, not exact types
      expect(mockCommentRepository.getCommentsByRequestId).toHaveBeenCalledWith(
        requestId,
      );
      expect(result).toBe(mockResponse);
    });

    it("should throw an error if repository fails", async () => {
      const requestId = "request-123";
      mockCommentRepository.getCommentsByRequestId.mockRejectedValue(
        new Error("Repository error"),
      );

      await expect(
        commentService.getCommentsByRequestId(requestId),
      ).rejects.toThrow("Failed to get comments");
      expect(mockCommentRepository.getCommentsByRequestId).toHaveBeenCalledWith(
        requestId,
      );
    });
  });

  describe("getAllComments", () => {
    it("should successfully get all comments", async () => {
      // Use any to bypass type checking
      const mockResponse: any = [{ id: "comment-1", text: "Comment 1" }];

      // Mock repository method
      mockCommentRepository.getAllComments.mockResolvedValue(mockResponse);

      // Call service method
      const result = await commentService.getAllComments();

      // Assertions - focus on behavior, not exact types
      expect(mockCommentRepository.getAllComments).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it("should throw an error if repository fails", async () => {
      mockCommentRepository.getAllComments.mockRejectedValue(
        new Error("Repository error"),
      );

      await expect(commentService.getAllComments()).rejects.toThrow(
        "Failed to get comments",
      );
      expect(mockCommentRepository.getAllComments).toHaveBeenCalled();
    });
  });
});
