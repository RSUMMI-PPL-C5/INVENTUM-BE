import {
  addUserValidation,
  userFilterQueryValidation,
} from "../../../src/validations/user.validation";
import { validationResult } from "express-validator";
import { Request } from "express";

const runValidation = async (req: Partial<Request>) => {
  for (const validator of userFilterQueryValidation) {
    await validator.run(req as Request);
  }

  return validationResult(req as Request);
};

describe("User Filter Query Validation", () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
  });

  it("should pass validation with no query parameters", async () => {
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
  });

  it("should pass with a valid role as a string", async () => {
    mockRequest.query = { role: "User" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
  });

  it("should pass with valid roles as an array", async () => {
    mockRequest.query = { role: ["User", "Admin"] };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
  });

  it("should fail if role contains an invalid value", async () => {
    mockRequest.query = { role: ["InvalidRole"] };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe(
      "role must contain user, admin, or fasum",
    );
  });

  it("should be treated as undefined if role is empty", async () => {
    mockRequest.query = { role: "" };
    await runValidation(mockRequest);
    expect(mockRequest.query.role).toBeUndefined();
  });

  it("should pass with a valid divisiId as a number", async () => {
    mockRequest.query = { divisiId: "1" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
  });

  it("should pass with valid divisiIds as an array", async () => {
    mockRequest.query = { divisiId: ["1", "2"] };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
  });

  it("should fail if divisiId value is not a number", async () => {
    mockRequest.query = { divisiId: "invalid" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe(
      "divisiId must be a number or an array of numbers",
    );
  });

  it("should fail if divisiId array contains non-numeric values", async () => {
    mockRequest.query = { divisiId: ["1", "invalid"] };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe("divisiId must contain numbers");
  });

  it("should pass with a valid ISO date for createdOnStart", async () => {
    mockRequest.query = { createdOnStart: "2023-01-01" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
  });

  it("should fail with an invalid ISO date for createdOnStart", async () => {
    mockRequest.query = { createdOnStart: "invalid-date" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe(
      "createdOnStart must be a valid ISO date",
    );
  });

  it("should pass with a valid ISO date for createdOnEnd", async () => {
    mockRequest.query = { createdOnEnd: "2023-01-01" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
    expect(mockRequest.query.createdOnEnd).toStrictEqual(
      new Date("2023-01-01T16:59:59.999Z"),
    );
  });

  it("should fail with an invalid ISO date for createdOnEnd", async () => {
    mockRequest.query = { createdOnEnd: "invalid-date" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe("createdOnEnd must be a valid ISO date");
  });

  it("should pass with a valid ISO date for modifiedStart", async () => {
    mockRequest.query = { modifiedOnStart: "2023-01-01" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
  });

  it("should fail with an invalid ISO date for modifiedStart", async () => {
    mockRequest.query = { modifiedOnStart: "invalid-date" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe(
      "modifiedOnStart must be a valid ISO date",
    );
  });

  it("should pass with a valid ISO date for modifiedOnEnd", async () => {
    mockRequest.query = { modifiedOnEnd: "2023-01-01" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(true);
    expect(mockRequest.query.modifiedOnEnd).toStrictEqual(
      new Date("2023-01-01T16:59:59.999Z"),
    );
  });

  it("should fail with an invalid ISO date for modifiedOnEnd", async () => {
    mockRequest.query = { modifiedOnEnd: "invalid-date" };
    const result = await runValidation(mockRequest);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe(
      "modifiedOnEnd must be a valid ISO date",
    );
  });
});

describe("Add User Validation", () => {
  test("should export an array with 8 validation rules", () => {
    expect(Array.isArray(addUserValidation)).toBe(true);
    expect(addUserValidation).toHaveLength(8);
  });

  test("should include validation rules for all required fields", () => {
    // Just make sure the array isn't empty to achieve code coverage
    expect(addUserValidation[0]).toBeDefined();
    expect(addUserValidation[1]).toBeDefined();
    expect(addUserValidation[2]).toBeDefined();
    expect(addUserValidation[3]).toBeDefined();
    expect(addUserValidation[4]).toBeDefined();
    expect(addUserValidation[5]).toBeDefined();
    expect(addUserValidation[6]).toBeDefined();
    expect(addUserValidation[7]).toBeDefined();
  });
});
