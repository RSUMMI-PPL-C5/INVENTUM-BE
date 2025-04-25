import { validationResult } from "express-validator";
import {
  addSparepartValidation,
  updateSparepartValidation,
} from "../../../src/validations/spareparts.validation";

const runValidation = async (validation: any[], body: any) => {
  const req = {
    body,
    params: {},
    query: {},
    cookies: {},
    headers: {},
    get: jest.fn(),
  };
  const res = {};
  const next = jest.fn();

  for (const rule of validation) {
    await rule.run(req, res, next);
  }
  return validationResult(req);
};

describe("addSparepartValidation", () => {
  it("should pass with valid data", async () => {
    const result = await runValidation(addSparepartValidation, {
      partsName: "Sparepart A",
      purchaseDate: "2023-01-01",
      price: 100,
      toolLocation: "Warehouse",
      toolDate: "2023-01-01",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("should fail if partsName is missing", async () => {
    const result = await runValidation(addSparepartValidation, {});
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ path: "partsName" }),
    );
  });

  it("should fail if purchaseDate is in the future", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const result = await runValidation(addSparepartValidation, {
      partsName: "Sparepart A",
      purchaseDate: futureDate,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Purchase date cannot be in the future" }),
    );
  });

  it("should fail if purchaseDate is invalid", async () => {
    const result = await runValidation(addSparepartValidation, {
      partsName: "Sparepart A",
      purchaseDate: "not-a-date",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Purchase date must be a valid date" }),
    );
  });

  it("should fail if price is negative", async () => {
    const result = await runValidation(addSparepartValidation, {
      partsName: "Sparepart A",
      price: -10,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Price cannot be negative" }),
    );
  });

  it("should fail if price is not a number", async () => {
    const result = await runValidation(addSparepartValidation, {
      partsName: "Sparepart A",
      price: "abc",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Price must be a number" }),
    );
  });

  it("should fail if toolLocation is not a string", async () => {
    const result = await runValidation(addSparepartValidation, {
      partsName: "Sparepart A",
      toolLocation: 123,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Tool location must be a string" }),
    );
  });

  it("should fail if toolDate is not a string", async () => {
    const result = await runValidation(addSparepartValidation, {
      partsName: "Sparepart A",
      toolDate: 123,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Tool date must be a valid date" }),
    );
  });
});

describe("updateSparepartValidation", () => {
  it("should pass with valid data", async () => {
    const result = await runValidation(updateSparepartValidation, {
      partsName: "Sparepart B",
      purchaseDate: "2023-01-01",
      price: 200,
      toolLocation: "Warehouse",
      toolDate: "2023-01-01",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("should pass if no fields are provided", async () => {
    const result = await runValidation(updateSparepartValidation, {});
    expect(result.isEmpty()).toBe(true);
  });

  it("should fail if partsName is empty string", async () => {
    const result = await runValidation(updateSparepartValidation, {
      partsName: "",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({
        msg: "Sparepart name cannot be empty if provided",
      }),
    );
  });

  it("should fail if purchaseDate is in the future", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const result = await runValidation(updateSparepartValidation, {
      purchaseDate: futureDate,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Purchase date cannot be in the future" }),
    );
  });

  it("should fail if purchaseDate is invalid", async () => {
    const result = await runValidation(updateSparepartValidation, {
      purchaseDate: "not-a-date",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Purchase date must be a valid date" }),
    );
  });

  it("should fail if price is negative", async () => {
    const result = await runValidation(updateSparepartValidation, {
      price: -10,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Price cannot be negative" }),
    );
  });

  it("should fail if price is not a number", async () => {
    const result = await runValidation(updateSparepartValidation, {
      price: "abc",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Price must be a number" }),
    );
  });

  it("should fail if toolLocation is not a string", async () => {
    const result = await runValidation(updateSparepartValidation, {
      toolLocation: 123,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Tool location must be a string" }),
    );
  });

  it("should fail if toolDate is not a string", async () => {
    const result = await runValidation(updateSparepartValidation, {
      toolDate: 123,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toContainEqual(
      expect.objectContaining({ msg: "Tool date must be a valid date" }),
    );
  });
});
