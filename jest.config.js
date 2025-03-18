module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: [
    "**/**tests**/**/*.test.ts",
    "**/**tests**/**/*.test.tsx",
    "**/*.test.ts",
    "**/*.test.tsx",
  ],
  testPathIgnorePatterns: [
    "/src/middleware/",
    "/src/routes/",
    "/src/controllers/auth.controller.ts",
    "<rootDir>/__tests__/unit/controller/auth.*",
    "<rootDir>/__tests__/unit/middleware/",
    "<rootDir>/__tests__/index.*",
  ],
};
