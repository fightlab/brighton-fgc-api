import { gqlCall } from '@graphql/resolvers/test/helper';

describe('Bracket Platform GraphQL Resolver Test', () => {
  it('returns all bracket platforms', async () => {
    const source = `
      query SelectAllBracketPlatforms {
        bracket_platforms {
          _id
          name
          url
          api_url
          api_docs
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platforms).toHaveLength(0);
  });
});
