module.exports = {
 testEnvironment: 'node',
 coverageDirectory: 'coverage',
 collectCoverageFrom: [
   'src/**/*.js',
   '!src/**/*.test.js',
   '!src/**/index.js',
   '!src/server.js',
   '!src/config/*.js'
 ],
 testMatch: [
   '<rootDir>/tests/**/*.test.js',
   '<rootDir>/tests/**/*.spec.js'
 ],
 testPathIgnorePatterns: [
   '/node_modules/',
   '/dist/',
   '/coverage/'
 ],
 moduleNameMapper: {
   '^@/(.*)$': '<rootDir>/src/$1',
   '^@models/(.*)$': '<rootDir>/src/models/$1',
   '^@services/(.*)$': '<rootDir>/src/services/$1',
   '^@controllers/(.*)$': '<rootDir>/src/api/controllers/$1',
   '^@middlewares/(.*)$': '<rootDir>/src/api/middlewares/$1',
   '^@utils/(.*)$': '<rootDir>/src/utils/$1',
   '^@config/(.*)$': '<rootDir>/src/config/$1'
 },
 setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
 coverageThreshold: {
   global: {
     branches: 80,
     functions: 80,
     lines: 80,
     statements: 80
   }
 },
 moduleFileExtensions: ['js', 'json'],
 transform: {
   '^.+\\.js$': 'babel-jest'
 },
 verbose: true,
 forceExit: true,
 clearMocks: true,
 resetMocks: true,
 restoreMocks: true
};