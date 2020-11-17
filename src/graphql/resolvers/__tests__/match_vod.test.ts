import { DocumentType } from '@typegoose/typegoose';
import { Vod, VodModel } from '@models/vod';
import { Match, MatchModel } from '@models/match';
import { Character, CharacterModel } from '@models/character';
import { MatchVod, MatchVodModel } from '@models/match_vod';
import {
  generateMatch,
  generateVod,
  generateCharacter,
  generateMatchVod,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual } from 'lodash';
import { CreateQuery } from 'mongoose';

describe('MatchVod GraphQL Resolver Test', () => {
  // variables
  let matches: Array<DocumentType<Match>>;
  let vods: Array<DocumentType<Vod>>;
  let characters: Array<DocumentType<Character>>;
  let matchVods: Array<DocumentType<MatchVod>>;

  // set up variables
  beforeEach(async () => {
    matches = await MatchModel.create(
      Array.from(
        {
          length: 4,
        },
        () =>
          generateMatch(
            new ObjectId(),
            [new ObjectId()],
            [new ObjectId()],
            false,
          ),
      ) as CreateQuery<Match>[],
    );

    vods = await VodModel.create(
      matches.map(() =>
        generateVod(new ObjectId(), new ObjectId()),
      ) as CreateQuery<Vod>[],
    );

    characters = await CharacterModel.create(
      Array.from(
        {
          length: 8,
        },
        () => generateCharacter(new ObjectId(), false),
      ) as CreateQuery<Character>[],
    );

    matchVods = await MatchVodModel.create([
      ...matches.map((m, i) =>
        generateMatchVod(m._id, vods[i]._id, false, [
          characters[i]._id,
          characters[(i + 1) * 2 - 1]._id,
        ]),
      ),
      generateMatchVod(
        matches[matches.length - 1]._id,
        vods[vods.length - 1]._id,
        true,
      ),
    ] as CreateQuery<MatchVod>[]);
  });

  // find
  it('should get all match vods with all fields', async () => {
    const source = gql`
      query MatchVods {
        match_vods {
          _id
          vod_id
          match_id
          character_ids
          timestamp
        }
      }
    `;

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(matchVods.length);
    expect(
      every(
        output.data?.match_vods,
        (e) =>
          some(matchVods, (s) => s.id === e._id) &&
          some(matchVods, (s) => s.timestamp === e.timestamp) &&
          some(matchVods, (s) => s.vod?.toString() === e.vod_id) &&
          some(matchVods, (s) => s.match?.toString() === e.match_id) &&
          e.character_ids.length >= 0,
      ),
    ).toBe(true);
  });

  it('should get match vod by id', async () => {
    const source = gql`
      query MatchVod($id: ObjectId!) {
        match_vod(id: $id) {
          _id
          vod_id
          match_id
          timestamp
          character_ids
        }
      }
    `;

    const input = matchVods[0];

    const variableValues = {
      id: input._id,
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeDefined();
    expect(output.data?.match_vod._id).toBe(input.id);
    expect(output.data?.match_vod.vod_id).toBe(input.vod?.toString());
    expect(output.data?.match_vod.vod_id).toBe(vods[0].id);
    expect(output.data?.match_vod.match_id).toBe(input.match?.toString());
    expect(output.data?.match_vod.match_id).toBe(matches[0].id);
    expect(output.data?.match_vod.character_ids).toHaveLength(
      input.characters?.length ?? -1,
    );
    expect(
      every(
        output.data?.match_vod.character_ids,
        (e) =>
          some(input.characters, (s) => s?.toString() === e) &&
          some(characters, (s) => s.id === e),
      ),
    ).toBe(true);
  });

  it('should return null if not found by id', async () => {
    const source = gql`
      query MatchVod($id: ObjectId!) {
        match_vod(id: $id) {
          _id
          vod_id
          match_id
          timestamp
          character_ids
        }
      }
    `;

    const variableValues = {
      id: new ObjectId(),
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeNull();
  });

  it('should get match vod by match id', async () => {
    const source = gql`
      query MatchVod($match: ObjectId!) {
        match_vod(match: $match) {
          _id
          vod_id
          match_id
          timestamp
          character_ids
        }
      }
    `;

    const input = matchVods[0];

    const variableValues = {
      match: matches[0]._id,
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeDefined();
    expect(output.data?.match_vod._id).toBe(input.id);
    expect(output.data?.match_vod.vod_id).toBe(input.vod?.toString());
    expect(output.data?.match_vod.vod_id).toBe(vods[0].id);
    expect(output.data?.match_vod.match_id).toBe(input.match?.toString());
    expect(output.data?.match_vod.match_id).toBe(matches[0].id);
    expect(output.data?.match_vod.character_ids).toHaveLength(
      input.characters?.length ?? -1,
    );
    expect(
      every(
        output.data?.match_vod.character_ids,
        (e) =>
          some(input.characters, (s) => s?.toString() === e) &&
          some(characters, (s) => s.id === e),
      ),
    ).toBe(true);
  });

  it('should return null if not found by match id', async () => {
    const source = gql`
      query MatchVod($match: ObjectId!) {
        match_vod(match: $match) {
          _id
          vod_id
          match_id
          timestamp
          character_ids
        }
      }
    `;

    const variableValues = {
      match: new ObjectId(),
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeNull();
  });

  it('should return null if id or match id not included', async () => {
    const source = gql`
      query MatchVod {
        match_vod {
          _id
          vod_id
          match_id
          timestamp
          character_ids
        }
      }
    `;

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeNull();
  });

  // populate
  it('should populate match', async () => {
    const source = gql`
      query MatchVod($id: ObjectId!) {
        match_vod(id: $id) {
          _id
          match_id
          match {
            _id
            round_name
          }
        }
      }
    `;

    const input = matchVods[0];

    const variableValues = {
      id: input._id,
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeDefined();
    expect(output.data?.match_vod._id).toBe(input.id);
    expect(output.data?.match_vod.match).toBeDefined();
    expect(output.data?.match_vod.match._id).toBe(
      output.data?.match_vod.match_id,
    );
    expect(output.data?.match_vod.match._id).toBe(input.match?.toString());
    expect(output.data?.match_vod.match._id).toBe(matches[0].id);
    expect(output.data?.match_vod.match.round_name).toBe(matches[0].round_name);
  });

  it('should populate vod', async () => {
    const source = gql`
      query MatchVod($id: ObjectId!) {
        match_vod(id: $id) {
          _id
          vod_id
          vod {
            _id
            platform_id
          }
        }
      }
    `;

    const input = matchVods[0];

    const variableValues = {
      id: input._id,
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeDefined();
    expect(output.data?.match_vod._id).toBe(input.id);
    expect(output.data?.match_vod.vod).toBeDefined();
    expect(output.data?.match_vod.vod._id).toBe(output.data?.match_vod.vod_id);
    expect(output.data?.match_vod.vod._id).toBe(input.vod?.toString());
    expect(output.data?.match_vod.vod._id).toBe(vods[0].id);
    expect(output.data?.match_vod.vod.platform_id).toBe(vods[0].platform_id);
  });

  it('should populate characters', async () => {
    const source = gql`
      query MatchVod($id: ObjectId!) {
        match_vod(id: $id) {
          _id
          character_ids
          characters {
            _id
            name
          }
        }
      }
    `;

    const input = matchVods[0];

    const variableValues = {
      id: input._id,
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeDefined();
    expect(output.data?.match_vod._id).toBe(input.id);
    expect(output.data?.match_vod.characters).toHaveLength(
      output.data?.match_vod.character_ids.length,
    );
    expect(output.data?.match_vod.characters).toHaveLength(
      input.characters?.length ?? -1,
    );
    expect(
      every(
        output.data?.match_vod.characters,
        (e) =>
          some(input.characters, (c) => c?.toString() === e._id) &&
          some(characters, (c) => c.id === e._id) &&
          some(characters, (c) => c.name === e.name),
      ),
    ).toBe(true);
  });

  it('should return empty array if no characters in match vod', async () => {
    const source = gql`
      query MatchVod($id: ObjectId!) {
        match_vod(id: $id) {
          _id
          character_ids
          characters {
            _id
            name
          }
        }
      }
    `;

    const input = matchVods[matchVods.length - 1];

    const variableValues = {
      id: input._id,
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vod).toBeDefined();
    expect(output.data?.match_vod._id).toBe(input.id);
    expect(output.data?.match_vod.character_ids).toHaveLength(0);
    expect(output.data?.match_vod.characters).toHaveLength(0);
  });

  // sort
  it('should sort by match id', async () => {
    const source = gql`
      query MatchVod {
        match_vods(sort: MATCH_ID) {
          _id
          match_id
          vod_id
        }
      }
    `;

    const expected = orderBy(
      matchVods.map((m) => m.match?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(matchVods.length);

    const dataFromQuery: Array<any> = output.data?.match_vods;
    const received: Array<string> = dataFromQuery.map((p) => p.match_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort by vod id', async () => {
    const source = gql`
      query MatchVod {
        match_vods(sort: VOD_ID) {
          _id
          match_id
          vod_id
        }
      }
    `;

    const expected = orderBy(
      matchVods.map((m) => m.vod?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(matchVods.length);

    const dataFromQuery: Array<any> = output.data?.match_vods;
    const received: Array<string> = dataFromQuery.map((p) => p.vod_id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort by id', async () => {
    const source = gql`
      query MatchVod {
        match_vods(sort: ID) {
          _id
          match_id
          vod_id
        }
      }
    `;

    const expected = orderBy(
      matchVods.map((m) => m.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({ source });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(matchVods.length);

    const dataFromQuery: Array<any> = output.data?.match_vods;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  // search
  it('should search by ids', async () => {
    const source = gql`
      query MatchVod($ids: [ObjectId!]) {
        match_vods(ids: $ids) {
          _id
          match_id
          vod_id
          character_ids
        }
      }
    `;

    const variableValues = {
      ids: [matchVods[0]._id, matchVods[1]._id],
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(2);
    expect(
      every(
        output.data?.match_vods,
        (e) => e._id === matchVods[0].id || e._id === matchVods[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if not found by ids', async () => {
    const source = gql`
      query MatchVod($ids: [ObjectId!]) {
        match_vods(ids: $ids) {
          _id
          match_id
          vod_id
          character_ids
        }
      }
    `;

    const variableValues = {
      ids: [new ObjectId()],
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(0);
  });

  it('should search by match ids', async () => {
    const source = gql`
      query MatchVod($matches: [ObjectId!]) {
        match_vods(matches: $matches) {
          _id
          match_id
          vod_id
          character_ids
        }
      }
    `;

    const variableValues = {
      matches: [matches[0]._id, matches[1]._id],
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(2);
    expect(
      every(
        output.data?.match_vods,
        (e) => e.match_id === matches[0].id || e.match_id === matches[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if not found by match ids', async () => {
    const source = gql`
      query MatchVod($matches: [ObjectId!]) {
        match_vods(matches: $matches) {
          _id
          match_id
          vod_id
          character_ids
        }
      }
    `;

    const variableValues = {
      matches: [new ObjectId()],
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(0);
  });

  it('should search by vod ids', async () => {
    const source = gql`
      query MatchVod($vods: [ObjectId!]) {
        match_vods(vods: $vods) {
          _id
          match_id
          vod_id
          character_ids
        }
      }
    `;

    const variableValues = {
      vods: [vods[0]._id, vods[1]._id],
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(2);
    expect(
      every(
        output.data?.match_vods,
        (e) => e.vod_id === vods[0].id || e.vod_id === vods[1].id,
      ),
    ).toBe(true);
  });

  it('should return empty array if not found by vod ids', async () => {
    const source = gql`
      query MatchVod($vods: [ObjectId!]) {
        match_vods(vods: $vods) {
          _id
          match_id
          vod_id
          character_ids
        }
      }
    `;

    const variableValues = {
      vods: [new ObjectId()],
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(0);
  });

  it('should search by character ids', async () => {
    const source = gql`
      query MatchVod($characters: [ObjectId!]) {
        match_vods(characters: $characters) {
          _id
          match_id
          vod_id
          character_ids
        }
      }
    `;

    const variableValues = {
      characters: [characters[0]._id, characters[1]._id],
    };

    const output = await gqlCall({ source, variableValues });

    const filtered = matchVods.filter(
      (mv) =>
        !!mv.characters?.find(
          (c) =>
            c?.toString() === characters[0].id ||
            c?.toString() === characters[1].id,
        ),
    );

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(filtered.length);
  });

  it('should return empty array if not found by character ids', async () => {
    const source = gql`
      query MatchVod($characters: [ObjectId!]) {
        match_vods(characters: $characters) {
          _id
          match_id
          vod_id
          character_ids
        }
      }
    `;

    const variableValues = {
      characters: [new ObjectId()],
    };

    const output = await gqlCall({ source, variableValues });

    expect(output.data).toBeDefined();
    expect(output.data?.match_vods).toHaveLength(0);
  });
});
