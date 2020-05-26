// set up required env vars to stop tests breaking,
// they can be set to anything, just need to be defined
process.env.PORT = '9000';
process.env.MONGODB_URI = 'localhost';

module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  clearMocks: false,
  // aliases, also in tsconfig.json + backpack.config.js
  moduleNameMapper: {
    '@graphql/([^\\.]*)$': '<rootDir>/src/graphql/$1',
    '@lib/([^\\.]*)$': '<rootDir>/src/lib/$1',
    '@models/([^\\.]*)$': '<rootDir>/src/models/$1',
  },
  preset: 'ts-jest',
};
