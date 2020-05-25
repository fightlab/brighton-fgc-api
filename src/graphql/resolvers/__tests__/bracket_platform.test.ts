import { gqlCall } from '@graphql/resolvers/test/helper';
import { generateBracketPlatform } from '@lib/test/generate';
import { DocumentType } from '@typegoose/typegoose';
import { every, some } from 'lodash';
import {
  BracketPlatform,
  BracketPlatformModel,
} from '@models/bracket_platform';

describe('Bracket Platform GraphQL Resolver Test', () => {
  let bracketPlatforms: Array<DocumentType<BracketPlatform>>;

  beforeEach(async () => {
    bracketPlatforms = await BracketPlatformModel.create(
      Array.from(
        {
          length: 2,
        },
        () => generateBracketPlatform(false),
      ) as Array<BracketPlatform>,
    );
  });

  it('should return all bracket platforms with fields', async () => {
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
    expect(output.data?.bracket_platforms).toHaveLength(
      bracketPlatforms.length,
    );

    // check values matches for every element
    // e: each element in every, s: each element in some
    expect(
      every(
        output.data?.bracket_platforms,
        (e) =>
          some(bracketPlatforms, (s) => s.id === e._id) &&
          some(bracketPlatforms, (s) => s.name === e.name) &&
          some(bracketPlatforms, (s) => s.api_url === e.api_url) &&
          some(bracketPlatforms, (s) => s.api_docs === e.api_docs) &&
          some(bracketPlatforms, (s) => s.url === e.url),
      ),
    ).toBe(true);
  });

  it('should return a single bracket platform by id', async () => {
    const source = `
      query SelectSingleBracketPlatform($id: ObjectId!) {
        bracket_platform(id:$id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: bracketPlatforms[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platform._id).toBe(bracketPlatforms[0].id);
    expect(output.data?.bracket_platform.name).toBe(bracketPlatforms[0].name);
  });

  it('should return null if bracket platform id not found', async () => {
    const source = `
      query SelectSingleBracketPlatformNull($id: ObjectId!) {
        bracket_platform(id:$id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: '5eca9c57495caf001c2fb560',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platform).toBeNull();
  });
});
