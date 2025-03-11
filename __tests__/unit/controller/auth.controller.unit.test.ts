import request from "supertest"
import bcrypt from "bcrypt"
import server from "../../../src"

jest.mock("bcrypt")
jest.mock("jsonwebtoken")

describe("Auth API Endpoints", () => {

  it("should return 200 and a valid token when login is successful", async () => {
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mocked_token");

    const response = await request(server)
      .post("/auth")
      .send({ username: "testuser", password: "password123" })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("token", "mocked_token")
    expect(response.body).toMatchObject({
      id: "123",
      email: "test@example.com",
      username: "testuser",
    })
  })

  it("should return 401 when password is incorrect", async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const response = await request(server)
      .post("/auth")
      .send({ username: "testuser", password: "wrongpassword" })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty("message", "Invalid username or password")
  })

  it("should return 404 when username does not exist", async () => {
    const response = await request(server)
      .post("/auth")
      .send({ username: "unknownuser", password: "password123" })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty("message", "User not found")
  })

  it("should return 400 when username or password is missing", async () => {
    const response = await request(server).post("/auth").send({ username: "testuser" })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty("message", "Username and password are required")
  })

})

