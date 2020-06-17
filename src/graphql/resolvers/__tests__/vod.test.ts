import { DocumentType } from '@typegoose/typegoose';
import { Tournament, TournamentModel } from '@models/tournament';
import { VodPlatform, VodPlatformModel } from '@models/vod_platform';
import { Vod, VodModel } from '@models/vod';
import {
  generateVodPlatform,
  generateTournament,
  generateVod,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual } from 'lodash';

describe('VOD GraphQL Resolver Test', () => {
  let tournaments: Array<DocumentType<Tournament>>;
  let vodPlatforms: Array<DocumentType<VodPlatform>>;
  let vods: Array<DocumentType<Vod>>;

  beforeEach(async () => {
    vodPlatforms = await VodPlatformModel.create([
      generateVodPlatform(),
      generateVodPlatform(),
    ]);

    tournaments = await TournamentModel.create(
      vodPlatforms.flatMap(() => [
        generateTournament(new ObjectId(), [new ObjectId()], [new ObjectId()]),
        generateTournament(new ObjectId(), [new ObjectId()], [new ObjectId()]),
      ]),
    );

    vods = await VodModel.create(
      tournaments.map((tournament, i) =>
        generateVod(vodPlatforms[i % vodPlatforms.length]._id, tournament._id),
      ),
    );
  });

  it('should return vods with all fields', async () => {
    const source = gql`
      query Vods {
        vods {
          _id
          tournament_id
          vod_platform_id
          platform_id
          url
        }
      }
    `;

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toHaveLength(vods.length);
    expect(
      every(
        output.data?.vods,
        (e) =>
          some(vods, (s) => s.id === e._id) &&
          some(vods, (s) => s.tournament?.toString() === e.tournament_id) &&
          some(vods, (s) => s.platform?.toString() === e.vod_platform_id) &&
          some(vods, (s) => s.platform_id === e.platform_id) &&
          some(vods, (s) => s.url === e.url),
      ),
    ).toBe(true);
  });

  it('should return vod by id', async () => {
    const source = gql`
      query Vods($id: ObjectId!) {
        vod(id: $id) {
          _id
          tournament_id
          vod_platform_id
          platform_id
          url
        }
      }
    `;

    const variableValues = {
      id: vods[0]._id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod).toBeDefined();
    expect(output.data?.vod._id).toBe(vods[0].id);
    expect(output.data?.vod.platform_id).toBe(vods[0].platform_id);
    expect(output.data?.vod.url).toBe(vods[0].url);
    expect(output.data?.vod.tournament_id).toBe(vods[0].tournament?.toString());
    expect(output.data?.vod.tournament_id).toBe(tournaments[0].id);
    expect(output.data?.vod.vod_platform_id).toBe(vodPlatforms[0].id);
  });

  it('should return vod by tournament id', async () => {
    const source = gql`
      query Vods($tournament: ObjectId!) {
        vod(tournament: $tournament) {
          _id
          tournament_id
          vod_platform_id
          platform_id
          url
        }
      }
    `;

    const variableValues = {
      tournament: tournaments[0]._id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod).toBeDefined();
    expect(output.data?.vod._id).toBe(vods[0].id);
    expect(output.data?.vod.platform_id).toBe(vods[0].platform_id);
    expect(output.data?.vod.url).toBe(vods[0].url);
    expect(output.data?.vod.tournament_id).toBe(vods[0].tournament?.toString());
    expect(output.data?.vod.tournament_id).toBe(tournaments[0].id);
    expect(output.data?.vod.vod_platform_id).toBe(vodPlatforms[0].id);
  });

  it('should return null if id or tournament id not provided', async () => {
    const source = gql`
      query Vods {
        vod {
          _id
          tournament_id
          vod_platform_id
          platform_id
          url
        }
      }
    `;

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.vod).toBeNull();
  });

  it('should return null if id not found', async () => {
    const source = gql`
      query Vods($id: ObjectId!) {
        vod(id: $id) {
          _id
          tournament_id
          vod_platform_id
          platform_id
          url
        }
      }
    `;

    const variableValues = {
      id: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod).toBeNull();
  });

  it('should return null if tournament id not found', async () => {
    const source = gql`
      query Vods($tournament: ObjectId!) {
        vod(tournament: $tournament) {
          _id
          tournament_id
          vod_platform_id
          platform_id
          url
        }
      }
    `;

    const variableValues = {
      tournament: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod).toBeDefined();
  });

  // populate
  it('should populate tournament for a given vod', async () => {
    const source = gql`
      query Vods($id: ObjectId!) {
        vod(id: $id) {
          _id
          tournament_id
          tournament {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: vods[0]._id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod).toBeDefined();
    expect(output.data?.vod.tournament).toBeDefined();
    expect(output.data?.vod._id).toBe(vods[0].id);
    expect(output.data?.vod.tournament._id).toBe(
      vods[0].tournament?.toString(),
    );
    expect(output.data?.vod.tournament._id).toBe(tournaments[0].id);
    expect(output.data?.vod.tournament.name).toBe(tournaments[0].name);
  });

  it('should populate vod platform for a given vod', async () => {
    const source = gql`
      query Vods($id: ObjectId!) {
        vod(id: $id) {
          _id
          vod_platform_id
          vod_platform {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: vods[0]._id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vod).toBeDefined();
    expect(output.data?.vod.vod_platform).toBeDefined();
    expect(output.data?.vod._id).toBe(vods[0].id);
    expect(output.data?.vod.vod_platform._id).toBe(
      vods[0].platform?.toString(),
    );
    expect(output.data?.vod.vod_platform._id).toBe(vodPlatforms[0].id);
    expect(output.data?.vod.vod_platform.name).toBe(vodPlatforms[0].name);
  });

  // sort
  it('should sort vods by tournament id', async () => {
    const source = gql`
      query Vods {
        vods(sort: TOURNAMENT_ID) {
          _id
          tournament_id
        }
      }
    `;

    const expected = orderBy(
      vods.map((v) => v.tournament?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toHaveLength(vods.length);

    const dataFromQuery: Array<any> = output.data?.vods;
    const received: Array<string> = dataFromQuery.map((p) => p.tournament_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort vods by vod platform id', async () => {
    const source = gql`
      query Vods {
        vods(sort: VOD_PLATFORM_ID) {
          _id
          vod_platform_id
        }
      }
    `;

    const expected = orderBy(
      vods.map((v) => v.platform?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toHaveLength(vods.length);

    const dataFromQuery: Array<any> = output.data?.vods;
    const received: Array<string> = dataFromQuery.map((p) => p.vod_platform_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort vods by id', async () => {
    const source = gql`
      query Vods {
        vods(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      vods.map((v) => v.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toHaveLength(vods.length);

    const dataFromQuery: Array<any> = output.data?.vods;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  //search
  it('should return list of vods for given array of ids', async () => {
    const source = gql`
      query Vods($ids: [ObjectId!]) {
        vods(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [vods[0]._id, vods[1]._id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toBeDefined();
    expect(output.data?.vods).toHaveLength(2);
    expect(
      every(
        output.data?.vods,
        (e) => e._id === vods[0].id || e._id === vods[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty list if array of ids not found', async () => {
    const source = gql`
      query Vods($ids: [ObjectId!]) {
        vods(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [new ObjectId(), new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toBeDefined();
    expect(output.data?.vods).toHaveLength(0);
  });

  it('should return list of vods for given array of tournament ids', async () => {
    const source = gql`
      query Vods($tournaments: [ObjectId!]) {
        vods(tournaments: $tournaments) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournaments: [tournaments[0]._id, tournaments[1]._id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toBeDefined();
    expect(output.data?.vods).toHaveLength(2);
    expect(
      every(
        output.data?.vods,
        (e) =>
          e.tournament_id === tournaments[0].id ||
          e.tournament_id === tournaments[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty list if array of tournament ids not found', async () => {
    const source = gql`
      query Vods($tournaments: [ObjectId!]) {
        vods(tournaments: $tournaments) {
          _id
          tournament_id
        }
      }
    `;

    const variableValues = {
      tournaments: [new ObjectId(), new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toBeDefined();
    expect(output.data?.vods).toHaveLength(0);
  });

  it('should return list of vods for a given array of vod platform ids', async () => {
    const source = gql`
      query Vods($platforms: [ObjectId!]) {
        vods(vod_platforms: $platforms) {
          _id
          vod_platform_id
        }
      }
    `;

    const variableValues = {
      platforms: [vodPlatforms[0]._id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toBeDefined();
    expect(output.data?.vods).toHaveLength(
      vods.filter((v) => v.platform?.toString() === vodPlatforms[0].id).length,
    );
    expect(
      every(output.data?.vods, (e) => e.vod_platform_id === vodPlatforms[0].id),
    ).toBe(true);
  });

  it('should return empty list if array of vod platform ids not found', async () => {
    const source = gql`
      query Vods($platforms: [ObjectId!]) {
        vods(vod_platforms: $platforms) {
          _id
          vod_platform_id
        }
      }
    `;

    const variableValues = {
      platforms: [new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.vods).toBeDefined();
    expect(output.data?.vods).toHaveLength(0);
  });

  it.todo('should populate match vods for given vod');

  it.todo(
    'should return empty array of match vods if not found for a given vod',
  );
});
