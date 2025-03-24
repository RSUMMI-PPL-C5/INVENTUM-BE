import medicalEquipmentRouter from "../../../../src/routes/medicalequipment.route";

describe("Medical Equipment Routes", () => {
  test("should export a router with required methods", () => {
    // Pastikan `medicalEquipmentRouter` terdefinisi
    expect(medicalEquipmentRouter).toBeDefined();

    // Cek apakah router memiliki metode standar dari Express Router
    expect(medicalEquipmentRouter).toHaveProperty("get");
    expect(medicalEquipmentRouter).toHaveProperty("post");
    expect(medicalEquipmentRouter).toHaveProperty("put");
    expect(medicalEquipmentRouter).toHaveProperty("delete");
    expect(medicalEquipmentRouter).toHaveProperty("use");

    // Pastikan ini adalah instance dari Express Router
    expect(medicalEquipmentRouter.name).toBe("router");
  });
});
