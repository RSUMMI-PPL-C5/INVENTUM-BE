module.exports = {

    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: [
      '**/**tests**/**/*.test.ts',
      '**/**tests**/**/*.test.tsx',
      '**/*.test.ts',
      '**/*.test.tsx'
    ],
    testPathIgnorePatterns: ['<rootDir>/src/filters/'],
    coveragePathIgnorePatterns: ['<rootDir>/src/filters/']
  };
