// Testing the configuration

import { getConfig } from '@lib/config';

describe('Configuration', () => {
  // since we're modifying env vars, put a copy of the current env vars into memory
  const ORIGINAL_ENVIRONMENT_VARIABLES = process.env;

  // before each test, set env obj
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENVIRONMENT_VARIABLES };
  });

  // after each test reset to original vars
  afterEach(() => {
    process.env = ORIGINAL_ENVIRONMENT_VARIABLES;
  });

  test('it returns the configuration object with the correct values', () => {
    process.env.PORT = '9000';
    process.env.MONGODB_URI = 'mongo-uri';

    const output = getConfig();

    expect(output.port).toBe(9000);
    expect(output.env).toBe('test');
    expect(output.mongo.uri).toBe('mongo-uri');
    expect(output.isDev).toBeDefined();
    expect(output.isTest).toBeDefined();
    expect(output.isProd).toBeDefined();
  });

  test('it throws and exception if an environment variable is not set', () => {
    process.env.PORT = undefined;
    expect(() => getConfig()).toThrow();
  });
});
