module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  clearMocks: false,
  moduleNameMapper: {
    '@graphql/([^\\.]*)$': '<rootDir>/src/graphql/$1',
    '@lib/([^\\.]*)$': '<rootDir>/src/lib/$1',
    '@models/([^\\.]*)$': '<rootDir>/src/models/$1',
  },
};
