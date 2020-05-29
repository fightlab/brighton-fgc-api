import { gqlCall, gql } from '@graphql/resolvers/test/helper';
import { generateBracketPlatform } from '@graphql/resolvers/test/generate';
import { DocumentType } from '@typegoose/typegoose';
import { every, some, orderBy, isEqual } from 'lodash';
import {
  BracketPlatform,
  BracketPlatformModel,
} from '@models/bracket_platform';
import { ObjectId } from 'mongodb';

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
    const source = gql`
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
    const source = gql`
      query SelectSingleBracketPlatform($id: ObjectId!) {
        bracket_platform(id: $id) {
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
    const source = gql`
      query SelectSingleBracketPlatformNull($id: ObjectId!) {
        bracket_platform(id: $id) {
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

  it('should sort bracket platforms by name asc', async () => {
    const source = gql`
      query SortBracketPlatformNameAsc {
        bracket_platforms(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      bracketPlatforms.map((b) => b.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platforms).toHaveLength(
      bracketPlatforms.length,
    );

    const dataFromQuery: Array<any> = output.data?.bracket_platforms;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort bracket platforms by name desc', async () => {
    const source = gql`
      query SortBracketPlatformNameDesc {
        bracket_platforms(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      bracketPlatforms.map((b) => b.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platforms).toHaveLength(
      bracketPlatforms.length,
    );

    const dataFromQuery: Array<any> = output.data?.bracket_platforms;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort bracket platforms by id', async () => {
    const source = gql`
      query SortBracketPlatformNameDesc {
        bracket_platforms(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      bracketPlatforms.map((b) => b.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platforms).toHaveLength(
      bracketPlatforms.length,
    );

    const dataFromQuery: Array<any> = output.data?.bracket_platforms;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should search bracket platforms by name', async () => {
    const source = gql`
      query SearchBracketPlatformsByName($search: String!) {
        bracket_platforms(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // search by name lowercase to check it works
      search: bracketPlatforms[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platforms).toBeDefined();
    expect(output.data?.bracket_platforms).toHaveLength(1);
    expect(output.data?.bracket_platforms[0]._id).toBe(bracketPlatforms[0].id);
    expect(output.data?.bracket_platforms[0].name).toBe(
      bracketPlatforms[0].name,
    );
  });

  it('should return empty array if search bracket platforms by name returns no results', async () => {
    const source = gql`
      query SearchBracketPlatformsByName($search: String!) {
        bracket_platforms(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // use unintelligible string, highly unlikely it will be an actual name
      search: 'qqweqewcnoiaskhfnoihoiehtiohfoigafio',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platforms).toBeDefined();
    expect(output.data?.bracket_platforms).toHaveLength(0);
  });

  it('should search bracket platforms by list of ids', async () => {
    const source = gql`
      query BracketPlatformsByIds($ids: [ObjectId!]) {
        bracket_platforms(ids: $ids) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      ids: bracketPlatforms.map((p) => p.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platforms).toBeDefined();
    expect(output.data?.bracket_platforms).toHaveLength(
      bracketPlatforms.length,
    );
  });

  it('should return empty array if search bracket platforms by list of ids returns no results', async () => {
    const source = gql`
      query BracketPlatformsByIds($ids: [ObjectId!]) {
        bracket_platforms(ids: $ids) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // generate some fake object ids
      ids: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.bracket_platforms).toBeDefined();
    expect(output.data?.bracket_platforms).toHaveLength(0);
  });
});
