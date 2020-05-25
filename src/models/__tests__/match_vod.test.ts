import {
  DocumentType,
  isDocument,
  isDocumentArray,
} from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { MatchVod, MatchVodClass } from '@models/match_vod';
import { Match, MatchClass } from '@models/match';
import { Vod, VodClass } from '@models/vod';
import { CharacterModel, Character } from '@models/character';

describe('MatchVod model test', () => {
  let matches: Array<DocumentType<MatchClass>>;
  let vods: Array<DocumentType<VodClass>>;
  let characters: Array<DocumentType<Character>>;

  let matchVodFull: MatchVodClass;
  let matchVodMin: MatchVodClass;
  let matchVod: DocumentType<MatchVodClass>;

  beforeEach(async () => {
    // fake some tournament ids
    const tournaments: Array<Types.ObjectId> = [
      new Types.ObjectId(),
      new Types.ObjectId(),
    ];

    // fake a game id
    const game: Types.ObjectId = new Types.ObjectId();

    // fake some match
    matches = await Match.create([
      {
        tournament: tournaments[0],
      },
      {
        tournament: tournaments[1],
      },
    ] as Array<MatchClass>);

    // fake some vods
    vods = await Vod.create([
      {
        platform: new Types.ObjectId(),
        platform_id: '0',
        tournament: tournaments[0],
        url: 'https://youtube.com/0',
      },
      {
        platform: new Types.ObjectId(),
        platform_id: '0',
        tournament: tournaments[1],
        url: 'https://youtube.com/1',
      },
    ] as Array<VodClass>);

    // fake some characters
    characters = await CharacterModel.create([
      {
        game,
        name: 'Char 0',
        short: 'C0',
      },
      {
        game,
        name: 'Char 1',
        short: 'C1',
      },
      {
        game,
        name: 'Char 2',
        short: 'C2',
      },
      {
        game,
        name: 'Char 3',
        short: 'C3',
      },
    ] as Array<Character>);

    matchVodFull = {
      match: matches[0]._id,
      vod: vods[0]._id,
      characters: characters.map((c) => c._id),
      timestamp: '1000',
    };

    matchVodMin = {
      match: matches[1]._id,
      vod: vods[1]._id,
    };

    // add a match vod to the collection
    [matchVod] = await MatchVod.create([
      {
        match: matches[0]._id,
        vod: vods[0]._id,
        characters: characters.map((c) => c._id),
      },
    ] as Array<MatchVodClass>);
  });

  it('should create & save match vod successfully', async () => {
    const input = new MatchVod(matchVodFull);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(output?.characters && isDocumentArray(output?.characters)).toBe(
      false,
    );
    expect(isDocument(output?.match)).toBe(false);
    expect(isDocument(output?.vod)).toBe(false);

    expect(output.match?.toString()).toBe(matchVodFull.match?.toString());
    expect(output.match?.toString()).toBe(matches[0].id);
    expect(output.vod?.toString()).toBe(matchVodFull.vod?.toString());
    expect(output.vod?.toString()).toBe(vods[0].id);
    expect(output.characters?.length).toBe(matchVodFull.characters?.length);
    expect(output.characters?.length).toBe(characters.length);
    expect(output.timestamp).toBe(matchVodFull.timestamp);
  });

  it('should create & save min match vod successfully', async () => {
    const input = new MatchVod(matchVodMin);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output?.match)).toBe(false);
    expect(isDocument(output?.vod)).toBe(false);

    expect(output.match?.toString()).toBe(matchVodMin.match?.toString());
    expect(output.match?.toString()).toBe(matches[1].id);
    expect(output.vod?.toString()).toBe(matchVodMin.vod?.toString());
    expect(output.vod?.toString()).toBe(vods[1].id);
    expect(output.characters).toHaveLength(0);
    expect(output.timestamp).toBe('0');
  });

  it('should populate match', async () => {
    const output = await MatchVod.findById(matchVod.id).populate('match');

    expect(output).toBeDefined();
    if (output) {
      expect(output?.characters && isDocumentArray(output?.characters)).toBe(
        false,
      );
      expect(isDocument(output?.match)).toBe(true);
      expect(isDocument(output?.vod)).toBe(false);
      if (isDocument(output?.match)) {
        expect(output?.match.id).toBe(matches[0].id);
      }
    }
  });

  it('should populate vod', async () => {
    const output = await MatchVod.findById(matchVod.id).populate('vod');

    expect(output).toBeDefined();
    if (output) {
      expect(output?.characters && isDocumentArray(output?.characters)).toBe(
        false,
      );
      expect(isDocument(output?.match)).toBe(false);
      expect(isDocument(output?.vod)).toBe(true);
      if (isDocument(output?.vod)) {
        expect(output?.vod?.id).toBe(vods[0].id);
      }
    }
  });

  it('should populate characters', async () => {
    const output = await MatchVod.findById(matchVod.id).populate('characters');

    expect(output).toBeDefined();
    if (output) {
      expect(output?.characters && isDocumentArray(output?.characters)).toBe(
        true,
      );
      expect(isDocument(output?.match)).toBe(false);
      expect(isDocument(output?.vod)).toBe(false);
      if (output?.characters && isDocumentArray(output?.characters)) {
        expect(output?.characters).toHaveLength(4);
        expect(output?.characters?.[0].id).toBe(characters[0].id);
      }
    }
  });

  it('should populate all fields', async () => {
    const output = await MatchVod.findById(matchVod.id)
      .populate('match')
      .populate('vod')
      .populate('characters');

    expect(output).toBeDefined();
    if (output) {
      expect(output?.characters && isDocumentArray(output?.characters)).toBe(
        true,
      );
      expect(isDocument(output?.match)).toBe(true);
      expect(isDocument(output?.vod)).toBe(true);
      if (
        output?.characters &&
        isDocumentArray(output?.characters) &&
        isDocument(output?.match) &&
        isDocument(output?.vod)
      ) {
        expect(output?.characters).toHaveLength(4);
        expect(output?.characters?.[0].id).toBe(characters[0].id);
        expect(output?.match.id).toBe(matches[0].id);
        expect(output?.vod?.id).toBe(vods[0].id);
      }
    }
  });
});
