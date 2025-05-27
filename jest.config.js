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
    "/node_modules/",
    "/src/routes/metrics.route.ts",
    "/src/services/metrics.service.ts",
    "/src/middleware/metrics.middleware.ts",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/sentry/",
    "/src/routes/metrics.route.ts",
    "/src/services/metrics.service.ts",
    "/src/middleware/metrics.middleware.ts",
  ],
  coverageReporters: ["lcov", "text", "clover"],
};
