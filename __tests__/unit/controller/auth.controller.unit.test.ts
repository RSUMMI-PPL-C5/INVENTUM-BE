import request from "supertest";
import server from "../../../src/index";
import AuthService from "../../../src/services/auth.service";
import AppError from "../../../src/utils/appError";

// Mock AuthService untuk menghindari pemanggilan ke service asli
jest.mock("../services/auth.service");

describe("AuthController", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks(); // Reset mock agar test tidak saling mempengaruhi
  });

  describe("POST /login", () => {
    it("should login successfully and return a token (positive case)", async () => {
      const mockUser = { id: "123", username: "testuser", role: "user" };
      const mockToken = "mocked.jwt.token";

      // Mocking authService.login untuk return nilai yang diinginkan
      jest
        .spyOn(authService, "login")
        .mockResolvedValueOnce({ ...mockUser, token: mockToken });

      const response = await request(server).post("/login").send({
        username: "testuser",
        password: "password",
      });

      // Test response status dan konten
      expect(response.status).toBe(200);
      expect(response.body.token).toBe(mockToken);
      expect(response.body.username).toBe(mockUser.username);
    });

    it("should return 400 if username or password is missing (negative case)", async () => {
      const response = await request(server).post("/login").send({
        username: "",
        password: "",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Username and password are required");
    });

    it("should return 401 if username or password is incorrect (negative case)", async () => {
      // Mock error response
      jest
        .spyOn(authService, "login")
        .mockRejectedValueOnce(
          new AppError("Invalid username or password", 401),
        );

      const response = await request(server).post("/login").send({
        username: "wronguser",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid username or password");
    });

    it("should return 500 if JWT_SECRET_KEY is not set (corner case)", async () => {
      // Mocking a case where JWT_SECRET_KEY is missing
      jest.spyOn(authService, "login").mockImplementationOnce(() => {
        throw new AppError("JWT_SECRET_KEY is not set", 500);
      });

      const response = await request(server).post("/login").send({
        username: "testuser",
        password: "password",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("JWT_SECRET_KEY is not set");
    });

    it("should handle unexpected errors (exception case)", async () => {
      // Simulating an unexpected error (e.g., database failure)
      jest
        .spyOn(authService, "login")
        .mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await request(server).post("/login").send({
        username: "testuser",
        password: "password",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal Server Error");
    });
  });
});
