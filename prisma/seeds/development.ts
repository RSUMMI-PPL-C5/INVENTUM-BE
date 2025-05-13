import { v4 as uuidv4 } from "uuid";

// Add divisions data
export const divisions = [
  { id: 1, divisi: "Administrasi", parentId: null },
  { id: 2, divisi: "Teknik", parentId: null },
  { id: 3, divisi: "Medis", parentId: null },
];

// Data user untuk development
export const users = [
  {
    id: uuidv4(),
    email: "admin@inventum.dev",
    username: "admin",
    password: "$2a$10$GQeuXehdl58.VxoKhLKsZ.hQzX55zYvbd7ZiMHgL4n9U0w38XpIUq", // admin123
    role: "ADMIN",
    fullname: "Admin Developer",
    nokar: "ADM-DEV-001",
    waNumber: "081234567890",
    divisiId: 1,
    createdBy: "System",
    createdOn: new Date(),
  },
  {
    id: uuidv4(),
    email: "umum@inventum.dev",
    username: "umum",
    password: "$2a$10$GQeuXehdl58.VxoKhLKsZ.hQzX55zYvbd7ZiMHgL4n9U0w38XpIUq",
    role: "UMUM",
    fullname: "Teknisi Developer",
    nokar: "UMUM-DEV-001",
    waNumber: "081234567891",
    divisiId: 2,
    createdBy: "System",
    createdOn: new Date(),
  },
  {
    id: uuidv4(),
    email: "user@inventum.dev",
    username: "user",
    password: "$2a$10$GQeuXehdl58.VxoKhLKsZ.hQzX55zYvbd7ZiMHgL4n9U0w38XpIUq",
    role: "USER",
    fullname: "Staff Developer",
    nokar: "STF-DEV-001",
    waNumber: "081234567892",
    divisiId: 3,
    createdBy: "System",
    createdOn: new Date(),
  },
  {
    id: uuidv4(),
    email: "teknisi@inventum.dev",
    username: "teknisi",
    password: "$2a$10$GQeuXehdl58.VxoKhLKsZ.hQzX55zYvbd7ZiMHgL4n9U0w38XpIUq",
    role: "TEKNISI",
    fullname: "Teknisi Support",
    nokar: "TEK-DEV-001",
    waNumber: "081234567893",
    divisiId: 2,
    createdBy: "System",
    createdOn: new Date(),
  },
  {
    id: uuidv4(),
    email: "supervisor@inventum.dev",
    username: "supervisor",
    password: "$2a$10$GQeuXehdl58.VxoKhLKsZ.hQzX55zYvbd7ZiMHgL4n9U0w38XpIUq",
    role: "SUPERVISOR",
    fullname: "Supervisor Departemen",
    nokar: "SPV-DEV-001",
    waNumber: "081234567894",
    divisiId: 1, // Administrasi division
    createdBy: "System",
    createdOn: new Date(),
  },
];

// Data lainnya...
