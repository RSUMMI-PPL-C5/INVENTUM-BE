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
  testPathIgnorePatterns: [],
  coveragePathIgnorePatterns: ["/sentry/"],
  coverageReporters: ["lcov", "text", "clover"],
};
