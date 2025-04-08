import DivisionService from "../../../../src/services/division.service";
import DivisionRepository from "../../../../src/repository/division.repository";

jest.mock("../../../../src/repository/division.repository");

describe("DivisionService - DELETE", () => {
  let divisionService: DivisionService;
  let mockDivisionRepository: jest.Mocked<DivisionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDivisionRepository =
      new DivisionRepository() as jest.Mocked<DivisionRepository>;
    divisionService = new DivisionService(mockDivisionRepository);
  });

  it("should delete a division and return true", async () => {
    mockDivisionRepository.deleteDivision.mockResolvedValue(true);

    const result = await divisionService.deleteDivision(1);

    expect(mockDivisionRepository.deleteDivision).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it("should return false if division not found", async () => {
    mockDivisionRepository.deleteDivision.mockResolvedValue(false);

    const result = await divisionService.deleteDivision(1);

    expect(mockDivisionRepository.deleteDivision).toHaveBeenCalledWith(1);
    expect(result).toBe(false);
  });

  it("should handle errors", async () => {
    const errorMessage = "Database error";
    mockDivisionRepository.deleteDivision.mockRejectedValue(
      new Error(errorMessage),
    );

    await expect(divisionService.deleteDivision(1)).rejects.toThrow(
      errorMessage,
    );
    expect(mockDivisionRepository.deleteDivision).toHaveBeenCalledWith(1);
  });
});
