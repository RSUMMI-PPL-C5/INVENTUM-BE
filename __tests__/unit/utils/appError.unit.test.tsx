import AppError from "../../../src/utils/appError";

describe("AppError", () => {
  it("should create an AppError instance with the correct message and statusCode", () => {
    const message = "Something went wrong";
    const statusCode = 400;

    const error = new AppError(message, statusCode);

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.stack).toBeDefined();
  });

  it("should capture the stack trace correctly", () => {
    const message = "Stack trace test";
    const statusCode = 500;

    const error = new AppError(message, statusCode);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain(message);
  });
});
