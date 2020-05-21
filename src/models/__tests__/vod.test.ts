import { Types } from 'mongoose';
import { default as moment } from 'moment';
import { Tournament, ITournament, TOURNAMENT_TYPE } from '@models/tournament';
import { VodPlatform, IVodPlatform } from '@models/vod_platform';
import { IVod, Vod } from '@models/vod';

describe('Vod model test', () => {
  let tournaments: Array<Tournament>;
  let platforms: Array<VodPlatform>;

  let vodFull: IVod;
  let vodMin: IVod;
  let vod: Vod;

  beforeEach(async () => {
    // fake some tournaments
    tournaments = await Tournament.create([
      {
        name: 'Tournament #1',
        date_start: moment.utc().subtract(1, 'd').toDate(),
        date_end: moment.utc().subtract(1, 'd').add(4, 'h').toDate(),
        event: new Types.ObjectId(),
        games: [new Types.ObjectId()],
        type: TOURNAMENT_TYPE.DOUBLE_ELIMINATION,
        is_team_based: false,
        players: [new Types.ObjectId()],
      },
      {
        name: 'Tournament #2',
        date_start: moment.utc().subtract(1, 'd').toDate(),
        date_end: moment.utc().subtract(1, 'd').add(4, 'h').toDate(),
        event: new Types.ObjectId(),
        games: [new Types.ObjectId()],
        type: TOURNAMENT_TYPE.DOUBLE_ELIMINATION,
        is_team_based: false,
        players: [new Types.ObjectId()],
      },
    ] as Array<ITournament>);

    // fake some vod platforms
    platforms = await VodPlatform.create([
      {
        name: 'Vod Platform #1',
        url: 'https://vodplatform.com',
      },
    ] as Array<IVodPlatform>);

    vodFull = {
      tournament: tournaments[0]._id,
      platform: platforms[0]._id,
      platform_id: 'vod-full-id',
      url: 'https://vodplayer.co.uk/vod/vod-full-id',
      start_time: '1000',
    };

    vodMin = {
      tournament: tournaments[1]._id,
      platform: platforms[0]._id,
      platform_id: 'vod-full-id',
      url: 'https://vodplayer.co.uk/vod/vod-full-id',
    };

    [vod] = await Vod.create([vodFull] as Array<IVod>);
  });

  it('should create & save vod successfully', async () => {
    const input = new Vod(vodFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.tournament.toString()).toBe(vodFull.tournament.toString());
    expect(output.tournament.toString()).toBe(tournaments[0].id);
    expect(output.platform.toString()).toBe(vodFull.platform.toString());
    expect(output.platform.toString()).toBe(platforms[0].id);
    expect(output.platform_id).toBe(vodFull.platform_id);
    expect(output.start_time).toBe(vodFull.start_time);

    // should not populate virtuals
    expect(output._tournament).toBeUndefined();
    expect(output._platform).toBeUndefined();
  });

  it('should create & save min vod successfully', async () => {
    const input = new Vod(vodMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.tournament.toString()).toBe(vodMin.tournament.toString());
    expect(output.tournament.toString()).toBe(tournaments[1].id);
    expect(output.platform.toString()).toBe(vodMin.platform.toString());
    expect(output.platform.toString()).toBe(platforms[0].id);
    expect(output.platform_id).toBe(vodMin.platform_id);
    expect(output.start_time).toBe('0');

    // should not populate virtuals
    expect(output._tournament).toBeUndefined();
    expect(output._platform).toBeUndefined();
  });

  it('should populate tournament', async () => {
    const output = await Vod.findById(vod.id).populate('_tournament');

    expect(output?._tournament).toBeDefined();
    expect(output?._tournament?.id).toBe(tournaments[0].id);

    expect(output?._platform).toBeUndefined();
  });

  it('should populate platform', async () => {
    const output = await Vod.findById(vod.id).populate('_platform');

    expect(output?._platform).toBeDefined();
    expect(output?._platform?.id).toBe(platforms[0].id);

    expect(output?._tournament).toBeUndefined();
  });

  it('should populate all fields', async () => {
    const output = await Vod.findById(vod.id)
      .populate('_tournament')
      .populate('_platform');

    expect(output?._tournament).toBeDefined();
    expect(output?._tournament?.id).toBe(tournaments[0].id);

    expect(output?._platform).toBeDefined();
    expect(output?._platform?.id).toBe(platforms[0].id);
  });
});
