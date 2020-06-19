// config file, to pull any useful configuration information into a single callable function
// that returns an object containing our app configuration

// auth0 interface object for config
interface Auth0 {
  enabled: boolean;
  audience?: string;
  issuer?: string;
}

// the config object, properties in here are returned to be used
interface Config {
  env: string;
  port: number;
  mongo: {
    uri: string;
    options: {
      [key: string]: boolean;
      useCreateIndex: boolean;
    };
  };
  seedDB: boolean;
  isDev: () => boolean;
  isTest: () => boolean;
  isProd: () => boolean;
  auth0: Auth0;
}

// enum to check the possible values for the node environment
export enum NODE_ENV {
  DEV = 'development',
  TEST = 'test',
  PROD = 'production',
}

// check node environment is valid, return development as default
export const checkNodeEnv = (env?: string): string => {
  switch (env) {
    case NODE_ENV.DEV:
    case NODE_ENV.TEST:
    case NODE_ENV.PROD:
      return env;
    default:
      return NODE_ENV.DEV;
  }
};

// check if environment variable exists, or throw
// this will mean app will not startup without the variable
const getOrThrowEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw Error(`You must set the ${key} environment variable`);
  }
  return value;
};

// get the auth0 object, by checking if first enabled,
// and if so check the audience and issuer
const checkAuth0Config = (): Auth0 => {
  const enabled = process.env.AUTH0_ENABLED;
  const auth0: Auth0 = {
    // enabled if set to "true", any other value is false
    enabled: enabled === 'true',
  };

  // if true, check for required variables
  if (auth0.enabled) {
    auth0.audience = getOrThrowEnv('AUTH0_AUDIENCE');
    auth0.issuer = getOrThrowEnv('AUTH0_ISSUER');
  }

  return auth0;
};

// get the node env based on the environment variable
const env = checkNodeEnv(process.env.NODE_ENV);

// export a function that will retrieve the configuration
export const getConfig = (): Config => ({
  env,
  port: +getOrThrowEnv('PORT'),
  mongo: {
    uri: getOrThrowEnv('MONGODB_URI'),
    options: {
      useCreateIndex: true,
    },
  },
  seedDB: !!process.env.SEED_DB || false,
  isDev: () => env === NODE_ENV.DEV,
  isTest: () => env === NODE_ENV.TEST,
  isProd: () => env === NODE_ENV.PROD,
  auth0: checkAuth0Config(),
});
