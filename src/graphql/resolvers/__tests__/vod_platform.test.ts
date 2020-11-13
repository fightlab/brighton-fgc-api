import { VodPlatform, VodPlatformModel } from '@models/vod_platform';
import { DocumentType } from '@typegoose/typegoose';
import {
  generateVodPlatform,
  generateVod,
} from '@graphql/resolvers/test/generate';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual } from 'lodash';
import { ObjectId } from 'mongodb';
import { VodModel } from '@models/vod';

describe('VOD Platform GraphQL Resolver Test', () => {
  let vodPlatforms: Array<DocumentType<VodPlatform>>;

  beforeEach(async () => {
    vodPlatforms = await VodPlatformModel.create(
      Array.from(
        {
          length: 3,
        },
        () => generateVodPlatform(false),
      ),
    );
  });

  it('should return all vod platforms with fields', async () => {
    const source = gql`
      query VodPlatforms {
        vod_platforms {
          _id
          name
          url
          watch_url
          embed_url
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platforms).toHaveLength(vodPlatforms.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    expect(
      every(
        output.data?.vod_platforms,
        (e) =>
          some(vodPlatforms, (s) => s.id === e._id) &&
          some(vodPlatforms, (s) => s.name === e.name) &&
          some(vodPlatforms, (s) => s.watch_url === e.watch_url) &&
          some(vodPlatforms, (s) => s.embed_url === e.embed_url) &&
          some(vodPlatforms, (s) => s.url === e.url),
      ),
    ).toBe(true);
  });

  it('should return a single vod platform by id', async () => {
    const source = gql`
      query VodPlatforms($id: ObjectId!) {
        vod_platform(id: $id) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      id: vodPlatforms[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platform._id).toBe(vodPlatforms[0].id);
    expect(output.data?.vod_platform.name).toBe(vodPlatforms[0].name);
  });

  it('should return null if vod platform id not found', async () => {
    const source = gql`
      query VodPlatforms($id: ObjectId!) {
        vod_platform(id: $id) {
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
    expect(output.data?.vod_platform).toBeNull();
  });

  it('should sort vod platforms by name asc', async () => {
    const source = gql`
      query VodPlatforms {
        vod_platforms(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      vodPlatforms.map((b) => b.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platforms).toHaveLength(vodPlatforms.length);

    const dataFromQuery: Array<any> = output.data?.vod_platforms;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort vod platforms by name asc', async () => {
    const source = gql`
      query VodPlatforms {
        vod_platforms(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      vodPlatforms.map((b) => b.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platforms).toHaveLength(vodPlatforms.length);

    const dataFromQuery: Array<any> = output.data?.vod_platforms;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort vod platforms by id', async () => {
    const source = gql`
      query VodPlatforms {
        vod_platforms(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      vodPlatforms.map((b) => b.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platforms).toHaveLength(vodPlatforms.length);

    const dataFromQuery: Array<any> = output.data?.vod_platforms;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should search vod platforms by name', async () => {
    const source = gql`
      query VodPlatforms($search: String!) {
        vod_platforms(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // search by name lowercase to check it works
      search: vodPlatforms[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platforms).toBeDefined();
    expect(output.data?.vod_platforms).toHaveLength(1);
    expect(output.data?.vod_platforms[0]._id).toBe(vodPlatforms[0].id);
    expect(output.data?.vod_platforms[0].name).toBe(vodPlatforms[0].name);
  });

  it('should return empty array if search vod platforms by name returns no results', async () => {
    const source = gql`
      query VodPlatforms($search: String!) {
        vod_platforms(search: $search) {
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
    expect(output.data?.vod_platforms).toBeDefined();
    expect(output.data?.vod_platforms).toHaveLength(0);
  });

  it('should search vod platforms by list of ids', async () => {
    const source = gql`
      query VodPlatforms($ids: [ObjectId!]) {
        vod_platforms(ids: $ids) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      ids: vodPlatforms.map((p) => p.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platforms).toBeDefined();
    expect(output.data?.vod_platforms).toHaveLength(vodPlatforms.length);
  });

  it('should return empty array if search vod platforms by list of ids returns no results', async () => {
    const source = gql`
      query VodPlatforms($ids: [ObjectId!]) {
        vod_platforms(ids: $ids) {
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
    expect(output.data?.vod_platforms).toBeDefined();
    expect(output.data?.vod_platforms).toHaveLength(0);
  });

  it('should populate vods for a given vod platform', async () => {
    await VodModel.create([
      generateVod(vodPlatforms[0]._id, new ObjectId()),
      generateVod(vodPlatforms[0]._id, new ObjectId()),
      generateVod(vodPlatforms[1]._id, new ObjectId()),
    ]);

    const source = gql`
      query VodPlatform($id: ObjectId!) {
        vod_platform(id: $id) {
          _id
          vods {
            _id
            vod_platform_id
          }
        }
      }
    `;

    const variableValues = {
      id: vodPlatforms[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platform._id).toBe(vodPlatforms[0].id);
    expect(output.data?.vod_platform.vods).toHaveLength(2);
    expect(
      every(
        output.data?.vod_platform.vods,
        (e) => e.vod_platform_id === vodPlatforms[0].id,
      ),
    ).toBe(true);
  });

  it('should return empty list of vods if not found for given vod platform', async () => {
    const source = gql`
      query VodPlatform($id: ObjectId!) {
        vod_platform(id: $id) {
          _id
          vods {
            _id
            vod_platform_id
          }
        }
      }
    `;

    const variableValues = {
      id: vodPlatforms[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod_platform._id).toBe(vodPlatforms[0].id);
    expect(output.data?.vod_platform.vods).toHaveLength(0);
  });
});
