import medicalEquipmentRouter from "../../../../src/routes/medicalequipment.route";

describe("Medical Equipment Routes", () => {
  test("should export a router with required methods", () => {
    // Ensure router is defined
    expect(medicalEquipmentRouter).toBeDefined();

    // Check for common Express router methods
    expect(medicalEquipmentRouter).toHaveProperty("get");
    expect(medicalEquipmentRouter).toHaveProperty("post");
    expect(medicalEquipmentRouter).toHaveProperty("put");
    expect(medicalEquipmentRouter).toHaveProperty("delete");
    expect(medicalEquipmentRouter).toHaveProperty("use");

    // Confirm it's an instance of Express Router
    expect(medicalEquipmentRouter.name).toBe("router");
  });
});
