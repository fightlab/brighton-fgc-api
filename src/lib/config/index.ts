interface Config {
  env: string;
  port: number;
  mongo: {
    uri: string;
  };
  isDev: () => boolean;
  isTest: () => boolean;
  isProd: () => boolean;
}

enum NODE_ENV {
  DEV = 'development',
  TEST = 'test',
  PROD = 'production',
}

// check node environment is valid
const checkNodeEnv = (env: string): string => {
  switch (env) {
    case NODE_ENV.DEV:
    case NODE_ENV.TEST:
    case NODE_ENV.PROD:
      return env;
    default:
      throw new Error(`NODE_ENV not valid`);
  }
};

// check if environment variable exists, or throw
const getOrThrowEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw Error(`You must set the ${key} environment variable`);
  }
  return value;
};

// node env
const env = checkNodeEnv(getOrThrowEnv('NODE_ENV'));

export const getConfig = (): Config => ({
  env,
  port: +getOrThrowEnv('PORT'),
  mongo: {
    uri: getOrThrowEnv('MONGODB_URI'),
  },
  isDev: () => env === NODE_ENV.DEV,
  isTest: () => env === NODE_ENV.TEST,
  isProd: () => env === NODE_ENV.PROD,
});
