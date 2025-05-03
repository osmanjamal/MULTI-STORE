module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverage: true,
    coverageDirectory: './coverage',
    coverageReporters: ['lcov', 'text-summary'],
    collectCoverageFrom: [
      'server/**/*.js',
      '!server/server.js',
      '!server/app.js',
      '!**/node_modules/**',
      '!**/vendor/**'
    ]
  };