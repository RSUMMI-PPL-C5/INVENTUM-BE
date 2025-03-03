import request from "supertest";
import app from "../api/index";

describe("User API Tests", () => {
  test("GET /users - should return all users' details", async () => {
    const response = await request(app).get("/api/users").expect(200);
    expect(response.body).toEqual([
      {
        id: 1,
        nokar: "001",
        fullname: "Harry Maguire",
        username: "upamaguire123",
        role: 3,
        divisi_id: 1,
        wa_number: "1234567890",
        CreatedBy: 1,
        CreatedOn: expect.any(String),
        ModifiedBy: undefined,
        ModifiedOn: expect.any(String),
        DeletedBy: undefined,
        DeletedOn: undefined,
        password: "hashedpassword1",
      },
      {
        id: 2,
        nokar: "002",
        fullname: "Ronaldo",
        username: "siuuuu123",
        role: 1,
        divisi_id: 2,
        wa_number: "0987654321",
        CreatedBy: 1,
        CreatedOn: expect.any(String),
        ModifiedBy: undefined,
        ModifiedOn: expect.any(String),
        DeletedBy: undefined,
        DeletedOn: undefined,
        password: "hashedpassword2",
      },
    ]);
  });

  test("GET /users/:id - should return user details", async () => {
    const response = await request(app).get("/api/users/1").expect(200);
    expect(response.body).toEqual({
      id: 1,
      nokar: "001",
      fullname: "Harry Maguire",
      username: "upamaguire123",
      role: 3,
      divisi_id: 1,
      wa_number: "1234567890",
      CreatedBy: 1,
      CreatedOn: expect.any(String),
      ModifiedBy: undefined,
      ModifiedOn: expect.any(String),
      DeletedBy: undefined,
      DeletedOn: undefined,
      password: "hashedpassword1", // Tambahkan password untuk mencocokkan data
    });
  });

  test("GET /users/:id - should return 404 if user not found", async () => {
    const response = await request(app).get("/api/users/999").expect(404);
    expect(response.body).toEqual({ message: "User not found" });
  });

  test("PUT /users/:id - should update user details", async () => {
    const updatedUser = {
      fullname: "Harry Updated",
      role: 3,
      password: "newpassword",
      divisi_id: 2,
      wa_number: "1234567890",
      ModifiedBy: 1,
    };

    const response = await request(app)
      .put("/api/users/1")
      .send(updatedUser)
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      nokar: "001",
      fullname: "Harry Updated",
      username: "upamaguire123",
      role: 3,
      divisi_id: 2,
      wa_number: "1234567890",
      CreatedBy: 1,
      CreatedOn: expect.any(String),
      ModifiedBy: 1,
      ModifiedOn: expect.any(String),
      DeletedBy: undefined,
      DeletedOn: undefined,
      password: expect.any(String), // Tambahkan password untuk mencocokkan data
    });
  });

  test("PUT /users/:id - should return 404 if user not found", async () => {
    const updatedUser = {
      fullname: "Nonexistent User",
      role: 1,
      password: "newpassword",
      divisi_id: 2,
      wa_number: "1234567890",
      ModifiedBy: 1,
    };

    const response = await request(app)
      .put("/api/users/999")
      .send(updatedUser)
      .expect(404);

    expect(response.body).toEqual({ message: "User not found" });
  });

  test("PUT /users/:id - should return 400 if data is invalid", async () => {
    const invalidUser = {
      fullname: "",
      role: "invalidrole",
      password: "short",
      divisi_id: 2,
      wa_number: "1234567890"
    };

    const response = await request(app)
      .put("/api/users/1")
      .send(invalidUser)
      .expect(400);

    expect(response.body).toEqual({ message: "Invalid data" });
  });
});

test("PUT /users/:id - should return 400 if fields have invalid name", async () => {
  const invalidUser = {
    fullname: "a", // Invalid name
    role: "invalidrole",
    password: "newpassword",
    divisi_id: "invalidDivisiId",
    wa_number: "1234567890",
    ModifiedBy: 1,
  };

  const response = await request(app)
    .put("/api/users/1")
    .send(invalidUser)
    .expect(400);

  expect(response.body).toEqual({ message: "Invalid data" });
});

test("PUT /users/:id - should return 400 if fields have invalid role data type", async () => {
  const invalidUser = {
    fullname: "Harry Updated",
    role: "invalidrole", // Invalid data type
    password: "newpassword",
    divisi_id: "invalidDivisiId", // Invalid data type
    wa_number: "1234567890",
    ModifiedBy: 1,
  };

  const response = await request(app)
    .put("/api/users/1")
    .send(invalidUser)
    .expect(400);

  expect(response.body).toEqual({ message: "Invalid data" });
});

test("PUT /users/:id - should return 400 if fields have invalid division data types", async () => {
  const invalidUser = {
    fullname: "Harry Updated",
    role: 1,
    password: "newpassword",
    divisi_id: "invalidDivisiId", // Invalid data type
    wa_number: "1234567890",
    ModifiedBy: 1,
  };

  const response = await request(app)
    .put("/api/users/1")
    .send(invalidUser)
    .expect(400);

  expect(response.body).toEqual({ message: "Invalid data" });
});

afterAll(() => {
  app.close();
});