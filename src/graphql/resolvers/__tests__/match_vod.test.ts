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
      ),
    );

    vods = await VodModel.create(
      matches.map(() => generateVod(new ObjectId(), new ObjectId())),
    );

    characters = await CharacterModel.create(
      Array.from(
        {
          length: 8,
        },
        () => generateCharacter(new ObjectId(), false),
      ),
    );

    matchVods = await MatchVodModel.create(
      matches.map((m, i) =>
        generateMatchVod(m._id, vods[i]._id, false, [
          characters[i]._id,
          characters[(i + 1) * 2 - 1]._id,
        ]),
      ),
    );
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
  });

  it.todo('should get match vod by id');

  it.todo('should return null if not found by id');

  it.todo('should get match vod by match id');

  it.todo('should return null if not found by match id');

  it.todo('should return null if id or match id not included');

  // populate
  it.todo('should populate match');

  it.todo('should populate vod');

  it.todo('should populate characters');

  it.todo('should return empty array if no characters in match vod');

  // sort
  it.todo('should sort by match id');

  it.todo('should sort by vod id');

  it.todo('should sort by id');

  // search
  it.todo('should search by ids');

  it.todo('should return empty array if not found by ids');

  it.todo('should search by match ids');

  it.todo('should return empty array if not found by match ids');

  it.todo('should search by vod ids');

  it.todo('should return empty array if not found by vod ids');

  it.todo('should search by character ids');

  it.todo('should return empty array if not found by character ids');
});
