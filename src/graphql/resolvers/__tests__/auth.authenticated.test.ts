import { mocked } from 'ts-jest/utils';

import { getConfig } from '@lib/config';
jest.mock('@lib/config');
const mockedGetConfig = mocked(getConfig, true);

// fake config to enable auth0
mockedGetConfig.mockReturnValue({
  env: 'test',
  port: 9999,
  mongo: { uri: 'mongo-uri', options: { useCreateIndex: true } },
  seedDB: false,
  isDev: () => false,
  isTest: () => true,
  isProd: () => false,
  auth0: {
    enabled: true,
  },
});

import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { ROLES } from '@lib/graphql';
import { User } from '@lib/auth';

describe('Auth (Authenticated) GraphQL Resolver Test', () => {
  const authenticatedUser: User = {
    exp: new Date().getTime() + 60 * 60 * 1000,
    permissions: [ROLES.ADMIN],
    scope: ROLES.ADMIN,
  };

  it('should return authenticated true if auth0 enabled', async () => {
    const source = gql`
      query Auth {
        authenticated
      }
    `;

    const output = await gqlCall({ source }, authenticatedUser);

    expect(output.data).toBeDefined();
    expect(output.data?.authenticated).toBe(true);
  });

  it('should return permissions and scope if auth0 enabled', async () => {
    const source = gql`
      query Auth {
        permissions
      }
    `;

    const output = await gqlCall({ source }, authenticatedUser);

    expect(output.data).toBeDefined();
    expect(output.data?.permissions).toEqual([ROLES.ADMIN]);
  });

  it('should return authenticatedAsAdmin true if auth0 enabled, and user has admin permissions', async () => {
    const source = gql`
      query Auth {
        authenticatedAsAdmin
      }
    `;

    const output = await gqlCall({ source }, authenticatedUser);

    expect(output.data).toBeDefined();
    expect(output.data?.authenticatedAsAdmin).toBe(true);
  });

  it('should return authenticated null if user not provided', async () => {
    const source = gql`
      query Auth {
        authenticated
      }
    `;

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.authenticated).toBeNull();
  });

  it('should return authenticated null if user not valid', async () => {
    const badUser: User = {
      exp: undefined,
      permissions: ['wat'],
      scope: 'nah',
    };

    const source = gql`
      query Auth {
        authenticated
      }
    `;

    const output = await gqlCall({ source }, badUser);

    expect(output.data).toBeDefined();
    expect(output.data?.authenticated).toBeNull();
  });

  it('should return null if not authenticatedAsAdmin', async () => {
    const badUser: User = {
      exp: authenticatedUser.exp,
      scope: 'notInScope',
      permissions: ['user'],
    };
    const source = gql`
      query Auth {
        authenticatedAsAdmin
      }
    `;

    const output = await gqlCall({ source }, badUser);

    expect(output.data).toBeDefined();
    expect(output.data?.authenticatedAsAdmin).toBeNull();
  });
});
