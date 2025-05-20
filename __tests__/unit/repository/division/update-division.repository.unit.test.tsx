import DivisionRepository from "../../../../src/repository/division.repository";
import prisma from "../../../../src/configs/db.config";
import AppError from "../../../../src/utils/appError";
import { Prisma } from "@prisma/client";

jest.mock("../../../../src/configs/db.config", () => ({
  listDivisi: {
    update: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe("DivisionRepository - UPDATE", () => {
  let divisionRepository: DivisionRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    divisionRepository = new DivisionRepository();
  });

  describe("updateDivision", () => {
    it("should update a division and return the updated division", async () => {
      const updatedDivision = {
        id: 1,
        divisi: "Updated Division",
        parentId: 2,
      };
      (prisma.listDivisi.update as jest.Mock).mockResolvedValue(
        updatedDivision,
      );

      const result = await divisionRepository.updateDivision(1, {
        divisi: "Updated Division",
        parent: { connect: { id: 2 } },
      });

      expect(prisma.listDivisi.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          divisi: "Updated Division",
          parent: { connect: { id: 2 } },
        },
      });
      expect(result).toEqual(updatedDivision);
    });

    // New tests for name validation
    it("should throw an error when updating a division with only whitespace in name", async () => {
      await expect(
        divisionRepository.updateDivision(1, { divisi: "    " }),
      ).rejects.toThrow(
        "Division name cannot be empty or contain only whitespace",
      );

      // Verify that the update method was never called
      expect(prisma.listDivisi.update).not.toHaveBeenCalled();
    });

    it("should throw an error when updating a division with empty string name", async () => {
      await expect(
        divisionRepository.updateDivision(1, { divisi: "" }),
      ).rejects.toThrow(
        "Division name cannot be empty or contain only whitespace",
      );

      expect(prisma.listDivisi.update).not.toHaveBeenCalled();
    });

    it("should throw an error when updating a division with null name", async () => {
      await expect(
        divisionRepository.updateDivision(1, { divisi: null }),
      ).rejects.toThrow(
        "Division name cannot be empty or contain only whitespace",
      );

      expect(prisma.listDivisi.update).not.toHaveBeenCalled();
    });

    it("should throw a 404 error if the division is not found (P2025)", async () => {
      // Create a mock Prisma error with P2025 code
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        {
          code: "P2025",
          clientVersion: "6.4.1",
        },
      );

      (prisma.listDivisi.update as jest.Mock).mockRejectedValue(prismaError);

      await expect(
        divisionRepository.updateDivision(1, { divisi: "Updated Division" }),
      ).rejects.toThrow(new AppError("Division with ID 1 not found", 404));

      expect(prisma.listDivisi.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { divisi: "Updated Division" },
      });
    });

    it("should throw a 400 error if the division name already exists (P2002)", async () => {
      // Create a mock Prisma error with P2002 code
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint violation",
        {
          code: "P2002",
          clientVersion: "6.4.1",
        },
      );

      (prisma.listDivisi.update as jest.Mock).mockRejectedValue(prismaError);

      await expect(
        divisionRepository.updateDivision(1, { divisi: "Duplicate Division" }),
      ).rejects.toThrow(
        new AppError("Division with this name already exists", 400),
      );

      expect(prisma.listDivisi.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { divisi: "Duplicate Division" },
      });
    });

    it("should throw a 400 error if the parent division ID is invalid (P2003)", async () => {
      // Create a mock Prisma error with P2003 code
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint violation",
        {
          code: "P2003",
          clientVersion: "6.4.1",
        },
      );

      (prisma.listDivisi.update as jest.Mock).mockRejectedValue(prismaError);

      await expect(
        divisionRepository.updateDivision(1, {
          parent: { connect: { id: 99 } },
        }),
      ).rejects.toThrow(new AppError("Invalid parent division ID", 400));

      expect(prisma.listDivisi.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { parent: { connect: { id: 99 } } },
      });
    });

    it("should throw a 500 error for unknown errors", async () => {
      (prisma.listDivisi.update as jest.Mock).mockRejectedValue(
        "Unknown error",
      );

      await expect(
        divisionRepository.updateDivision(1, { divisi: "Updated Division" }),
      ).rejects.toThrow(
        new AppError("Failed to update division with ID 1: Unknown error", 500),
      );

      expect(prisma.listDivisi.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { divisi: "Updated Division" },
      });
    });
  });

  describe("hasCircularReference (recursive)", () => {
    it("should return false if divisionId and potentialAncestorId are the same", async () => {
      const result = await divisionRepository.hasCircularReference(1, 1);
      expect(result).toBe(false);
    });

    it("should return false if the division does not exist", async () => {
      (prisma.listDivisi.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await divisionRepository.hasCircularReference(1, 2);
      expect(result).toBe(false);

      expect(prisma.listDivisi.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { parentId: true },
      });
    });

    it("should return false if the division has null parentId", async () => {
      (prisma.listDivisi.findUnique as jest.Mock).mockResolvedValue({
        parentId: null,
      });

      const result = await divisionRepository.hasCircularReference(1, 2);
      expect(result).toBe(false);

      expect(prisma.listDivisi.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { parentId: true },
      });
    });

    it("should return true if the parentId matches the potentialAncestorId", async () => {
      (prisma.listDivisi.findUnique as jest.Mock).mockResolvedValue({
        parentId: 2,
      });

      const result = await divisionRepository.hasCircularReference(1, 2);
      expect(result).toBe(true);

      expect(prisma.listDivisi.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { parentId: true },
      });
    });

    it("should recursively check and return true if an ancestor matches the potentialAncestorId", async () => {
      (prisma.listDivisi.findUnique as jest.Mock)
        .mockResolvedValueOnce({ parentId: 3 }) // First call
        .mockResolvedValueOnce({ parentId: 2 }); // Second call

      const result = await divisionRepository.hasCircularReference(1, 2);
      expect(result).toBe(true);

      expect(prisma.listDivisi.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.listDivisi.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
        select: { parentId: true },
      });
      expect(prisma.listDivisi.findUnique).toHaveBeenNthCalledWith(2, {
        where: { id: 3 },
        select: { parentId: true },
      });
    });

    it("should recursively check and return false if no ancestor matches the potentialAncestorId", async () => {
      (prisma.listDivisi.findUnique as jest.Mock)
        .mockResolvedValueOnce({ parentId: 3 }) // First call
        .mockResolvedValueOnce({ parentId: 4 }) // Second call
        .mockResolvedValueOnce({ parentId: null }); // Third call

      const result = await divisionRepository.hasCircularReference(1, 2);
      expect(result).toBe(false);

      expect(prisma.listDivisi.findUnique).toHaveBeenCalledTimes(3);
      expect(prisma.listDivisi.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
        select: { parentId: true },
      });
      expect(prisma.listDivisi.findUnique).toHaveBeenNthCalledWith(2, {
        where: { id: 3 },
        select: { parentId: true },
      });
      expect(prisma.listDivisi.findUnique).toHaveBeenNthCalledWith(3, {
        where: { id: 4 },
        select: { parentId: true },
      });
    });
  });
});
