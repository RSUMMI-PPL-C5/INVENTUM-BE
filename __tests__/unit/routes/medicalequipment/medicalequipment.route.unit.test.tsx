import medicalequipmentRoutes from "../../../../src/routes/medicalequipment.route";

// This test simply imports the route module and verifies it's an object
describe("Medical Equipment Routes", () => {
  test("should export a router with required methods", () => {
    // Just verify the router export exists and has expected properties
    expect(medicalequipmentRoutes).toBeDefined();

    // Check that it has typical router methods
    expect(medicalequipmentRoutes).toHaveProperty("get");

    // A more direct check that it's an Express router
    expect(medicalequipmentRoutes.name).toBe("router");
  });
});
