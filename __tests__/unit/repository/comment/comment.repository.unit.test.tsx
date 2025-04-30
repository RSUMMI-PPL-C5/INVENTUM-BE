import CommentRepository from "../../../../src/repository/comment.repository";
import { CreateCommentDto } from "../../../../src/dto/comment.dto";

// Mock the db.config import that's used in CommentRepository
jest.mock("../../../../src/configs/db.config", () => {
  return {
    __esModule: true,
    default: {
      comment: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    },
  };
});

// Import the mocked module
import prisma from "../../../../src/configs/db.config";

describe("CommentRepository", () => {
  let commentRepository: CommentRepository;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Initialize repository
    commentRepository = new CommentRepository();
  });

  describe("createComment", () => {
    it("should create a comment with requestId", async () => {
      // Mock data
      const commentData: CreateCommentDto = {
        text: "Test comment",
        userId: "user-123",
        requestId: "request-123",
      };

      const expectedResult = {
        id: "comment-123",
        text: commentData.text,
        userId: commentData.userId,
        requestId: commentData.requestId,
        createdAt: new Date(),
        modifiedAt: new Date(),
        user: {
          id: commentData.userId,
          fullname: "Test User",
          username: "testuser",
        },
        request: {
          id: commentData.requestId,
          title: "Test Request",
        },
      };

      // Set up the mock implementation
      (mockPrisma.comment.create as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      // Call repository method
      const result = await commentRepository.createComment(commentData);

      // Assertions
      expect(mockPrisma.comment.create).toHaveBeenCalledWith({
        data: {
          text: commentData.text,
          user: {
            connect: { id: commentData.userId },
          },
          request: {
            connect: { id: commentData.requestId },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
          request: true,
        },
      });

      expect(result).toEqual(expectedResult);
    });

    it("should create a comment without requestId", async () => {
      // Mock data without requestId
      const commentData: CreateCommentDto = {
        text: "Test comment",
        userId: "user-123",
      };

      const expectedResult = {
        id: "comment-123",
        text: commentData.text,
        userId: commentData.userId,
        requestId: null,
        createdAt: new Date(),
        modifiedAt: new Date(),
        user: {
          id: commentData.userId,
          fullname: "Test User",
          username: "testuser",
        },
        request: null,
      };

      // Set up the mock implementation
      (mockPrisma.comment.create as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      // Call repository method
      const result = await commentRepository.createComment(commentData);

      // Assertions
      expect(mockPrisma.comment.create).toHaveBeenCalledWith({
        data: {
          text: commentData.text,
          user: {
            connect: { id: commentData.userId },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
          request: true,
        },
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("getCommentsByRequestId", () => {
    it("should return comments for a given requestId", async () => {
      // Mock data
      const requestId = "request-123";
      const expectedComments = [
        {
          id: "comment-1",
          text: "Comment 1",
          userId: "user-1",
          requestId,
          createdAt: new Date(),
          modifiedAt: new Date(),
          user: {
            id: "user-1",
            fullname: "User One",
            username: "user1",
          },
        },
        {
          id: "comment-2",
          text: "Comment 2",
          userId: "user-2",
          requestId,
          createdAt: new Date(),
          modifiedAt: new Date(),
          user: {
            id: "user-2",
            fullname: "User Two",
            username: "user2",
          },
        },
      ];

      // Set up the mock implementation
      (mockPrisma.comment.findMany as jest.Mock).mockResolvedValue(
        expectedComments,
      );

      // Call repository method
      const result = await commentRepository.getCommentsByRequestId(requestId);

      // Assertions
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: {
          requestId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      expect(result).toEqual(expectedComments);
    });
  });

  describe("getAllComments", () => {
    it("should return all comments", async () => {
      // Mock data
      const expectedComments = [
        {
          id: "comment-1",
          text: "Comment 1",
          userId: "user-1",
          requestId: "request-1",
          createdAt: new Date(),
          modifiedAt: new Date(),
          user: {
            id: "user-1",
            fullname: "User One",
            username: "user1",
          },
          request: {
            id: "request-1",
            title: "Request One",
          },
        },
        {
          id: "comment-2",
          text: "Comment 2",
          userId: "user-2",
          requestId: "request-2",
          createdAt: new Date(),
          modifiedAt: new Date(),
          user: {
            id: "user-2",
            fullname: "User Two",
            username: "user2",
          },
          request: {
            id: "request-2",
            title: "Request Two",
          },
        },
      ];

      // Set up the mock implementation
      (mockPrisma.comment.findMany as jest.Mock).mockResolvedValue(
        expectedComments,
      );

      // Call repository method
      const result = await commentRepository.getAllComments();

      // Assertions
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
          request: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      expect(result).toEqual(expectedComments);
    });
  });
});
