import { mocked } from 'ts-jest/utils';

import { getConfig } from '@lib/config';
jest.mock('@lib/config');
const mockedGetConfig = mocked(getConfig, true);

// fake config to disable auth0
mockedGetConfig.mockReturnValue({
  env: 'test',
  port: 9999,
  mongo: { uri: 'mongo-uri', options: { useCreateIndex: true } },
  seedDB: false,
  isDev: () => false,
  isTest: () => true,
  isProd: () => false,
  auth0: {
    enabled: false,
  },
});

import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { ROLES } from '@lib/graphql';
import { User } from '@lib/auth';

describe('Auth (Unauthenticated) GraphQL Resolver Test', () => {
  const unauthenticatedUser: User = {
    permissions: [ROLES.ADMIN],
    scope: ROLES.ADMIN,
  };

  it('should return authenticated true if auth0 disabled', async () => {
    const source = gql`
      query Auth {
        authenticated
      }
    `;

    const output = await gqlCall({ source }, unauthenticatedUser);

    expect(output.data).toBeDefined();
    expect(output.data?.authenticated).toBe(true);
  });

  it('should return admin permission and scope if auth0 disabled', async () => {
    const source = gql`
      query Auth {
        permissions
      }
    `;

    const output = await gqlCall({ source }, unauthenticatedUser);

    expect(output.data).toBeDefined();
    expect(output.data?.permissions).toEqual([ROLES.ADMIN]);
  });
});
