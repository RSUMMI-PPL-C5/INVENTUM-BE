import userRoutes from "../../../../src/routes/user.route";

// This test simply imports the route module and verifies it's an object
describe("User Routes", () => {
  test("should export a router with required methods", () => {
    // Just verify the router export exists and has expected properties
    expect(userRoutes).toBeDefined();

    // Check that it has typical router methods
    expect(userRoutes).toHaveProperty("get");
    expect(userRoutes).toHaveProperty("post");
    expect(userRoutes).toHaveProperty("put");
    expect(userRoutes).toHaveProperty("delete");
    expect(userRoutes).toHaveProperty("use");

    // A more direct check that it's an Express router
    expect(userRoutes.name).toBe("router");
  });
});
