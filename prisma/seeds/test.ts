import { v4 as uuidv4 } from "uuid";

// Add divisions data
export const divisions = [
  { id: 1, divisi: "Administrasi", parentId: null },
  { id: 2, divisi: "Teknik", parentId: null },
  { id: 3, divisi: "Medis", parentId: null },
];

// Data user untuk testing
export const users = [
  {
    id: uuidv4(),
    email: "admin@inventum.test",
    username: "admin_test",
    password: "$2a$10$GQeuXehdl58.VxoKhLKsZ.hQzX55zYvbd7ZiMHgL4n9U0w38XpIUq",
    role: "ADMIN",
    fullname: "Admin Test",
    nokar: "ADM-TEST-001",
    waNumber: "081234567890",
    divisiId: 1,
    createdBy: "System",
    createdOn: new Date(),
  },
  {
    id: uuidv4(),
    email: "umum@inventum.test",
    username: "umum_test",
    password: "$2a$10$GQeuXehdl58.VxoKhLKsZ.hQzX55zYvbd7ZiMHgL4n9U0w38XpIUq",
    role: "UMUM",
    fullname: "Teknisi Test",
    nokar: "UMUM-TEST-001",
    waNumber: "081234567891",
    divisiId: 2,
    createdBy: "System",
    createdOn: new Date(),
  },
];
