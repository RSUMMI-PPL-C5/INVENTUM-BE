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
    roots: ['<rootDir>/api', '<rootDir>/__tests__'],
    collectCoverage: true,
    collectCoverageFrom: [
      'api/**/*.ts',
      'api/**/*.tsx',
      '!api/**/*.d.ts',
      '!api/**/__tests__/**',
      '!api/configs/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov', 'text'],
  };