import DivisionService from "../../../../src/services/division.service";
import DivisionRepository from "../../../../src/repository/division.repository";
import AppError from "../../../../src/utils/appError";

jest.mock("../../../../src/repository/division.repository");

describe("DivisionService - UPDATE", () => {
  let divisionService: DivisionService;
  let mockDivisionRepository: jest.Mocked<DivisionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDivisionRepository =
      new DivisionRepository() as jest.Mocked<DivisionRepository>;
    divisionService = new DivisionService(mockDivisionRepository);
  });

  // Positive test case
  it("should update a division and return the updated division", async () => {
    const updatedDivision = { id: 1, divisi: "Updated Division", parentId: 2 };
    mockDivisionRepository.getDivisionById.mockResolvedValue(updatedDivision);
    mockDivisionRepository.updateDivision.mockResolvedValue(updatedDivision);

    const result = await divisionService.updateDivision(1, {
      divisi: "Updated Division",
      parentId: 2,
    });

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.updateDivision).toHaveBeenCalledWith(1, {
      divisi: "Updated Division",
      parent: { connect: { id: 2 } },
    });
    expect(result).toEqual(updatedDivision);
  });

  it("should handle parentId as null and update the division", async () => {
    const updatedDivision = {
      id: 1,
      divisi: "Updated Division",
      parentId: null,
    };
    mockDivisionRepository.getDivisionById.mockResolvedValue(updatedDivision);
    mockDivisionRepository.updateDivision.mockResolvedValue(updatedDivision);

    const result = await divisionService.updateDivision(1, {
      divisi: "Updated Division",
      parentId: null,
    });

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.updateDivision).toHaveBeenCalledWith(1, {
      divisi: "Updated Division",
      parent: { disconnect: true },
    });
    expect(result).toEqual(updatedDivision);
  });

  // Negative test cases
  it("should throw an error if division ID does not exist", async () => {
    mockDivisionRepository.getDivisionById.mockResolvedValue(null);

    await expect(
      divisionService.updateDivision(1, { divisi: "Updated Division" }),
    ).rejects.toThrow(new AppError("Division with ID 1 not found", 404));

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.updateDivision).not.toHaveBeenCalled();
  });

  it("should throw an error if parentId does not exist", async () => {
    mockDivisionRepository.getDivisionById
      .mockResolvedValueOnce({
        id: 1,
        divisi: "Existing Division",
        parentId: null,
      })
      .mockResolvedValueOnce(null); // Parent division not found

    await expect(
      divisionService.updateDivision(1, { parentId: 99 }),
    ).rejects.toThrow(
      new AppError("Parent division with ID 99 not found", 404),
    );

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(99);
    expect(mockDivisionRepository.updateDivision).not.toHaveBeenCalled();
  });

  it("should throw an error if parentId creates a circular reference", async () => {
    mockDivisionRepository.getDivisionById.mockResolvedValue({
      id: 1,
      divisi: "Existing Division",
      parentId: null,
    });
    mockDivisionRepository.hasCircularReference.mockResolvedValue(true);

    await expect(
      divisionService.updateDivision(1, { parentId: 2 }),
    ).rejects.toThrow(
      new AppError(
        "Cannot set a descendant as parent (would create a cycle)",
        400,
      ),
    );

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.hasCircularReference).toHaveBeenCalledWith(
      2,
      1,
    );
    expect(mockDivisionRepository.updateDivision).not.toHaveBeenCalled();
  });

  // Corner cases
  it("should handle unexpected errors and throw AppError with status 500", async () => {
    const existingDivision = {
      id: 1,
      divisi: "Existing Division",
      parentId: null,
    };
    const errorMessage = "Unexpected database error";

    // Mock getDivisionById to return an existing division
    mockDivisionRepository.getDivisionById.mockResolvedValue(existingDivision);

    // Mock updateDivision to throw an unexpected error
    mockDivisionRepository.updateDivision.mockRejectedValue(
      new Error(errorMessage),
    );

    await expect(
      divisionService.updateDivision(1, { divisi: "Updated Division" }),
    ).rejects.toThrow(
      new AppError(`Failed to update division: ${errorMessage}`, 500),
    );

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.updateDivision).toHaveBeenCalledWith(1, {
      divisi: "Updated Division",
    });
  });

  it("should throw an error if parentId is the same as id", async () => {
    mockDivisionRepository.getDivisionById.mockResolvedValue({
      id: 1,
      divisi: "Existing Division",
      parentId: null,
    });

    await expect(
      divisionService.updateDivision(1, { parentId: 1 }),
    ).rejects.toThrow(new AppError("Division cannot be its own parent", 400));

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.updateDivision).not.toHaveBeenCalled();
  });

  it("should handle unknown errors and throw AppError with status 500", async () => {
    const existingDivision = {
      id: 1,
      divisi: "Existing Division",
      parentId: null,
    };

    // Mock getDivisionById to return an existing division
    mockDivisionRepository.getDivisionById.mockResolvedValue(existingDivision);

    // Mock updateDivision to throw an unknown error (not an instance of Error)
    mockDivisionRepository.updateDivision.mockRejectedValue("Unknown error");

    await expect(
      divisionService.updateDivision(1, { divisi: "Updated Division" }),
    ).rejects.toThrow(
      new AppError("Failed to update division: Unknown error", 500),
    );

    expect(mockDivisionRepository.getDivisionById).toHaveBeenCalledWith(1);
    expect(mockDivisionRepository.updateDivision).toHaveBeenCalledWith(1, {
      divisi: "Updated Division",
    });
  });
});
