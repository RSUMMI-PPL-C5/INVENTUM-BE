import DivisionService from "../../../../src/services/division.service";
import DivisionRepository from "../../../../src/repository/division.repository";

jest.mock("../../../../src/repository/division.repository");

describe("DivisionService", () => {
  let mockRepository: jest.Mocked<DivisionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new DivisionRepository() as jest.Mocked<DivisionRepository>;
  });

  describe("constructor", () => {
    it("should use provided repository when one is passed", () => {
      // Act
      const service = new DivisionService(mockRepository);
      
      // Assert - check that the service is using our mock repository
      const mockDivisions = [{ id: 1, divisi: "Test", parentId: null }];
      mockRepository.getAllDivisions.mockResolvedValue(mockDivisions);
      
      // This will only work if our mockRepository was properly assigned in constructor
      expect(service.getAllDivisions()).resolves.toEqual(mockDivisions);
    });

    it("should create new repository when none is provided", () => {
      // Act
      const service = new DivisionService();
      
      // Assert - create a new mock instance to check if a new repository was created
      const mockResult = [{ id: 1, divisi: "Test", parentId: null }];
      
      // Since we can't easily inspect the private property, we'll verify 
      // that a repository was created by mocking it and testing functionality
      const mockGetAll = jest.spyOn(DivisionRepository.prototype, 'getAllDivisions')
        .mockResolvedValue(mockResult);
      
      // This should call the newly created repository instance
      expect(service.getAllDivisions()).resolves.toEqual(mockResult);
      expect(mockGetAll).toHaveBeenCalled();
    });
  });

  describe("getAllDivisions", () => {
    it("should return divisions from repository", async () => {
      // Arrange
      const mockDivisions = [
        { id: 1, divisi: "Engineering", parentId: null },
        { id: 2, divisi: "Marketing", parentId: null }
      ];
      mockRepository.getAllDivisions.mockResolvedValue(mockDivisions);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getAllDivisions();
      
      // Assert
      expect(result).toEqual(mockDivisions);
      expect(mockRepository.getAllDivisions).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no divisions exist", async () => {
      // Arrange
      mockRepository.getAllDivisions.mockResolvedValue([]);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getAllDivisions();
      
      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
      expect(mockRepository.getAllDivisions).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from repository", async () => {
      // Arrange
      const error = new Error("Failed to fetch divisions");
      mockRepository.getAllDivisions.mockRejectedValue(error);
      const service = new DivisionService(mockRepository);
      
      // Act & Assert
      await expect(service.getAllDivisions()).rejects.toThrow("Failed to fetch divisions");
      expect(mockRepository.getAllDivisions).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDivisionsHierarchy", () => {
    it("should return hierarchical divisions from repository", async () => {
      // Arrange
      const mockHierarchy = [
        {
          id: 1,
          divisi: "Engineering",
          parentId: null,
          children: [
            {
              id: 11,
              divisi: "Software Engineering",
              parentId: 1,
              children: []
            }
          ]
        }
      ];
      mockRepository.getDivisionsHierarchy.mockResolvedValue(mockHierarchy);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getDivisionsHierarchy();
      
      // Assert
      expect(result).toEqual(mockHierarchy);
      expect(mockRepository.getDivisionsHierarchy).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no divisions exist", async () => {
      // Arrange
      mockRepository.getDivisionsHierarchy.mockResolvedValue([]);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getDivisionsHierarchy();
      
      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
      expect(mockRepository.getDivisionsHierarchy).toHaveBeenCalledTimes(1);
    });

    it("should handle divisions with empty children arrays", async () => {
      // Arrange
      const mockHierarchy = [
        {
          id: 1,
          divisi: "Engineering",
          parentId: null,
          children: []
        },
        {
          id: 2,
          divisi: "Marketing",
          parentId: null,
          children: []
        }
      ];
      mockRepository.getDivisionsHierarchy.mockResolvedValue(mockHierarchy);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getDivisionsHierarchy();
      
      // Assert
      expect(result).toEqual(mockHierarchy);
      expect(result[0].children).toEqual([]);
      expect(result[1].children).toEqual([]);
      expect(mockRepository.getDivisionsHierarchy).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from repository", async () => {
      // Arrange
      const error = new Error("Failed to fetch hierarchy");
      mockRepository.getDivisionsHierarchy.mockRejectedValue(error);
      const service = new DivisionService(mockRepository);
      
      // Act & Assert
      await expect(service.getDivisionsHierarchy()).rejects.toThrow("Failed to fetch hierarchy");
      expect(mockRepository.getDivisionsHierarchy).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDivisionsWithUserCount", () => {
    it("should return divisions with user count from repository", async () => {
      // Arrange
      const mockDivisionsWithCount = [
        { id: 1, divisi: "Engineering", parentId: null, userCount: 5 },
        { id: 2, divisi: "Marketing", parentId: null, userCount: 3 }
      ];
      mockRepository.getDivisionsWithUserCount.mockResolvedValue(mockDivisionsWithCount);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getDivisionsWithUserCount();
      
      // Assert
      expect(result).toEqual(mockDivisionsWithCount);
      expect(mockRepository.getDivisionsWithUserCount).toHaveBeenCalledTimes(1);
    });

    it("should handle divisions with zero users", async () => {
      // Arrange
      const mockDivisionsWithCount = [
        { id: 1, divisi: "Engineering", parentId: null, userCount: 0 },
        { id: 2, divisi: "Marketing", parentId: null, userCount: 0 }
      ];
      mockRepository.getDivisionsWithUserCount.mockResolvedValue(mockDivisionsWithCount);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getDivisionsWithUserCount();
      
      // Assert
      expect(result).toEqual(mockDivisionsWithCount);
      expect(result[0].userCount).toBe(0);
      expect(result[1].userCount).toBe(0);
      expect(mockRepository.getDivisionsWithUserCount).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from repository", async () => {
      // Arrange
      const error = new Error("Failed to fetch user counts");
      mockRepository.getDivisionsWithUserCount.mockRejectedValue(error);
      const service = new DivisionService(mockRepository);
      
      // Act & Assert
      await expect(service.getDivisionsWithUserCount()).rejects.toThrow("Failed to fetch user counts");
      expect(mockRepository.getDivisionsWithUserCount).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDivisionById", () => {
    it("should return division from repository when found", async () => {
      // Arrange
      const mockDivision = { 
        id: 5, 
        divisi: "Human Resources", 
        parentId: null 
      };
      mockRepository.getDivisionById = jest.fn().mockResolvedValue(mockDivision);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getDivisionById(5);
      
      // Assert
      expect(result).toEqual(mockDivision);
      expect(mockRepository.getDivisionById).toHaveBeenCalledWith(5);
      expect(mockRepository.getDivisionById).toHaveBeenCalledTimes(1);
    });

    it("should return null when division is not found", async () => {
      // Arrange
      mockRepository.getDivisionById = jest.fn().mockResolvedValue(null);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getDivisionById(999);
      
      // Assert
      expect(result).toBeNull();
      expect(mockRepository.getDivisionById).toHaveBeenCalledWith(999);
      expect(mockRepository.getDivisionById).toHaveBeenCalledTimes(1);
    });

    it("should pass error from repository to caller", async () => {
      // Arrange
      const error = new Error("Database error");
      mockRepository.getDivisionById = jest.fn().mockRejectedValue(error);
      const service = new DivisionService(mockRepository);
      
      // Act & Assert
      await expect(service.getDivisionById(1)).rejects.toThrow("Database error");
      expect(mockRepository.getDivisionById).toHaveBeenCalledWith(1);
      expect(mockRepository.getDivisionById).toHaveBeenCalledTimes(1);
    });

    it("should handle division with edge case ID values", async () => {
      // Arrange
      const mockDivision = { 
        id: 0, 
        divisi: "Executive", 
        parentId: null 
      };
      mockRepository.getDivisionById = jest.fn().mockResolvedValue(mockDivision);
      const service = new DivisionService(mockRepository);
      
      // Act
      const result = await service.getDivisionById(0);
      
      // Assert
      expect(result).toEqual(mockDivision);
      expect(mockRepository.getDivisionById).toHaveBeenCalledWith(0);
      expect(mockRepository.getDivisionById).toHaveBeenCalledTimes(1);
    });
  });
});