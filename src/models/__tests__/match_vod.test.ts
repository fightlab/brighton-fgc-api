import { Types } from 'mongoose';
import { MatchVod, IMatchVod } from '@models/match_vod';
import { Match, IMatch } from '@models/match';
import { Vod, IVod } from '@models/vod';
import { Character, ICharacter } from '@models/character';

describe('MatchVod model test', () => {
  let matches: Array<Match>;
  let vods: Array<Vod>;
  let characters: Array<Character>;

  let matchVodFull: IMatchVod;
  let matchVodMin: IMatchVod;
  let matchVod: MatchVod;

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
    ] as Array<IMatch>);

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
    ] as Array<IVod>);

    // fake some characters
    characters = await Character.create([
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
    ] as Array<ICharacter>);

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
    ] as Array<IMatchVod>);
  });

  it('should create & save match vod successfully', async () => {
    const input = new MatchVod(matchVodFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.match.toString()).toBe(matchVodFull.match.toString());
    expect(output.match.toString()).toBe(matches[0].id);
    expect(output.vod.toString()).toBe(matchVodFull.vod.toString());
    expect(output.vod.toString()).toBe(vods[0].id);
    expect(output.characters?.length).toBe(matchVodFull.characters?.length);
    expect(output.characters?.length).toBe(characters.length);
    expect(output.timestamp).toBe(matchVodFull.timestamp);

    // shouldn't populate virtuals
    expect(output._match).toBeUndefined();
    expect(output._vod).toBeUndefined();
    expect(output._characters).toBeUndefined();
  });

  it('should create & save min match vod successfully', async () => {
    const input = new MatchVod(matchVodMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.match.toString()).toBe(matchVodMin.match.toString());
    expect(output.match.toString()).toBe(matches[1].id);
    expect(output.vod.toString()).toBe(matchVodMin.vod.toString());
    expect(output.vod.toString()).toBe(vods[1].id);
    expect(output.characters).toHaveLength(0);
    expect(output.timestamp).toBe('0');

    // shouldn't populate virtuals
    expect(output._match).toBeUndefined();
    expect(output._vod).toBeUndefined();
    expect(output._characters).toBeUndefined();
  });

  it('should populate match', async () => {
    const output = await MatchVod.findById(matchVod.id).populate('_match');
    expect(output?._match).toBeDefined();
    expect(output?._match?.id).toBe(matches[0].id);

    expect(output?._vod).toBeUndefined();
    expect(output?._characters).toBeUndefined();
  });

  it('should populate vod', async () => {
    const output = await MatchVod.findById(matchVod.id).populate('_vod');
    expect(output?._vod).toBeDefined();
    expect(output?._vod?.id).toBe(vods[0].id);

    expect(output?._match).toBeUndefined();
    expect(output?._characters).toBeUndefined();
  });

  it('should populate characters', async () => {
    const output = await MatchVod.findById(matchVod.id).populate('_characters');

    expect(output?.characters).toHaveLength(4);
    expect(output?.characters?.[0].toString()).toBe(characters[0].id);

    expect(output?._match).toBeUndefined();
    expect(output?._vod).toBeUndefined();
  });
});
