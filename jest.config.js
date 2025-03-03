module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: [
      '**/__tests__/**/*.test.ts',
      '**/__tests__/**/*.test.tsx'
    ],
    roots: ['<rootDir>/api'],
    collectCoverage: true,
    collectCoverageFrom: [
      'api/**/*.ts',
      'api/**/*.tsx',
      '!api/**/*.d.ts',
      '!api/**/__tests__/**'
    ],
  };