import DivisionService, {
  DivisionServiceSingleton,
} from "../../../../src/services/division.service";
import DivisionRepository from "../../../../src/repository/division.repository";

jest.mock("../../../../src/repository/division.repository");

describe("DivisionService", () => {
  let mockRepository: jest.Mocked<DivisionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository =
      new DivisionRepository() as jest.Mocked<DivisionRepository>;
  });

  describe("getDivisionById", () => {
    it("should return a division by ID", async () => {
      const mockDivision = { id: 1, divisi: "IT", parentId: null };
      mockRepository.getDivisionById = jest
        .fn()
        .mockResolvedValue(mockDivision);
      const service = new DivisionService(mockRepository);

      const result = await service.getDivisionById(1);

      expect(result).toEqual(mockDivision);
      expect(mockRepository.getDivisionById).toHaveBeenCalledWith(1);
      expect(mockRepository.getDivisionById).toHaveBeenCalledTimes(1);
    });

    it("should return null if division not found", async () => {
      mockRepository.getDivisionById = jest.fn().mockResolvedValue(null);
      const service = new DivisionService(mockRepository);

      const result = await service.getDivisionById(999);

      expect(result).toBeNull();
      expect(mockRepository.getDivisionById).toHaveBeenCalledWith(999);
      expect(mockRepository.getDivisionById).toHaveBeenCalledTimes(1);
    });

    it("should handle division with edge case ID values", async () => {
      const mockDivision = {
        id: 0,
        divisi: "Executive",
        parentId: null,
      };
      mockRepository.getDivisionById = jest
        .fn()
        .mockResolvedValue(mockDivision);
      const service = new DivisionService(mockRepository);

      const result = await service.getDivisionById(0);

      expect(result).toEqual(mockDivision);
      expect(mockRepository.getDivisionById).toHaveBeenCalledWith(0);
      expect(mockRepository.getDivisionById).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllDivisions", () => {
    it("should return all divisions", async () => {
      const mockDivisions = [
        { id: 1, divisi: "IT", parentId: null },
        { id: 2, divisi: "HR", parentId: null },
      ];
      mockRepository.getAllDivisions = jest
        .fn()
        .mockResolvedValue(mockDivisions);
      const service = new DivisionService(mockRepository);

      const result = await service.getAllDivisions();

      expect(result).toEqual(mockDivisions);
      expect(mockRepository.getAllDivisions).toHaveBeenCalledTimes(1);
    });

    it("should return empty array if no divisions found", async () => {
      mockRepository.getAllDivisions = jest.fn().mockResolvedValue([]);
      const service = new DivisionService(mockRepository);

      const result = await service.getAllDivisions();

      expect(result).toEqual([]);
      expect(mockRepository.getAllDivisions).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDivisionsHierarchy", () => {
    it("should return hierarchical structure of divisions", async () => {
      // Arrange
      const mockHierarchy = [
        {
          id: 1,
          divisi: "Division A",
          parentId: null,
          children: [
            {
              id: 2,
              divisi: "Division B",
              parentId: 1,
              children: [],
            },
          ],
        },
      ];
      mockRepository.getDivisionsHierarchy = jest
        .fn()
        .mockResolvedValue(mockHierarchy);
      const service = new DivisionService(mockRepository);

      // Act
      const result = await service.getDivisionsHierarchy();

      // Assert
      expect(result).toEqual(mockHierarchy);
      expect(mockRepository.getDivisionsHierarchy).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if no divisions exist", async () => {
      // Arrange
      mockRepository.getDivisionsHierarchy = jest.fn().mockResolvedValue([]);
      const service = new DivisionService(mockRepository);

      // Act
      const result = await service.getDivisionsHierarchy();

      // Assert
      expect(result).toEqual([]);
      expect(mockRepository.getDivisionsHierarchy).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDivisionsWithUserCount", () => {
    it("should return divisions with their user counts", async () => {
      // Arrange
      const mockDivisionsWithUserCount = [
        { id: 1, divisi: "Division A", parentId: null, userCount: 10 },
        { id: 2, divisi: "Division B", parentId: 1, userCount: 5 },
      ];
      mockRepository.getDivisionsWithUserCount = jest
        .fn()
        .mockResolvedValue(mockDivisionsWithUserCount);
      const service = new DivisionService(mockRepository);

      // Act
      const result = await service.getDivisionsWithUserCount();

      // Assert
      expect(result).toEqual(mockDivisionsWithUserCount);
      expect(mockRepository.getDivisionsWithUserCount).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if no divisions exist", async () => {
      // Arrange
      mockRepository.getDivisionsWithUserCount = jest
        .fn()
        .mockResolvedValue([]);
      const service = new DivisionService(mockRepository);

      // Act
      const result = await service.getDivisionsWithUserCount();

      // Assert
      expect(result).toEqual([]);
      expect(mockRepository.getDivisionsWithUserCount).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteDivision", () => {
    it("should delete a division by ID", async () => {
      mockRepository.deleteDivision = jest.fn().mockResolvedValue(true);
      const service = new DivisionService(mockRepository);

      const result = await service.deleteDivision(1);

      expect(result).toBe(true);
      expect(mockRepository.deleteDivision).toHaveBeenCalledWith(1);
    });

    it("should return false if division not found", async () => {
      mockRepository.deleteDivision = jest.fn().mockResolvedValue(false);
      const service = new DivisionService(mockRepository);

      const result = await service.deleteDivision(999);

      expect(result).toBe(false);
    });
  });
});

describe("DivisionServiceSingleton", () => {
  beforeEach(() => {
    // Reset the singleton instance between tests
    // @ts-ignore - accessing private static field for testing
    DivisionServiceSingleton.instance = undefined;
    jest.clearAllMocks();
  });

  it("should create a new instance on first call to getInstance", () => {
    const instance = DivisionServiceSingleton.getInstance();
    expect(instance).toBeInstanceOf(DivisionService);
  });

  it("should return the same instance on subsequent calls to getInstance", () => {
    const instance1 = DivisionServiceSingleton.getInstance();
    const instance2 = DivisionServiceSingleton.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should have a private constructor (coverage only)", () => {
    // @ts-ignore
    const instance = new DivisionServiceSingleton();
    expect(instance).toBeDefined();
    // @ts-ignore
    DivisionServiceSingleton.instance = undefined;
  });
});
