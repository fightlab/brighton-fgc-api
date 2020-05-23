import { DocumentType, isDocument } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { default as moment } from 'moment';
import {
  Tournament,
  TournamentClass,
  TOURNAMENT_TYPE,
} from '@models/tournament';
import { VodPlatform, VodPlatformClass } from '@models/vod_platform';
import { VodClass, Vod } from '@models/vod';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

describe('Vod model test', () => {
  let tournaments: Array<DocumentType<TournamentClass>>;
  let platforms: Array<DocumentType<VodPlatformClass>>;

  let vodFull: VodClass;
  let vodMin: VodClass;
  let vod: DocumentType<VodClass>;

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
    ] as Array<TournamentClass>);

    // fake some vod platforms
    platforms = await VodPlatform.create([
      {
        name: 'Vod Platform #1',
        url: 'https://vodplatform.com',
      },
    ] as Array<VodPlatformClass>);

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

    [vod] = await Vod.create([vodFull] as Array<VodClass>);
  });

  it('should create & save vod successfully', async () => {
    const input = new Vod(vodFull);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output?.platform)).toBe(false);
    expect(isDocument(output?.tournament)).toBe(false);

    expect(output.tournament?.toString()).toBe(vodFull.tournament?.toString());
    expect(output.tournament?.toString()).toBe(tournaments[0].id);
    expect(output.platform?.toString()).toBe(vodFull.platform?.toString());
    expect(output.platform?.toString()).toBe(platforms[0].id);
    expect(output.platform_id).toBe(vodFull.platform_id);
    expect(output.start_time).toBe(vodFull.start_time);
  });

  it('should create & save min vod successfully', async () => {
    const input = new Vod(vodMin);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output?.platform)).toBe(false);
    expect(isDocument(output?.tournament)).toBe(false);

    expect(output.tournament?.toString()).toBe(vodMin.tournament?.toString());
    expect(output.tournament?.toString()).toBe(tournaments[1].id);
    expect(output.platform?.toString()).toBe(vodMin.platform?.toString());
    expect(output.platform?.toString()).toBe(platforms[0].id);
    expect(output.platform_id).toBe(vodMin.platform_id);
    expect(output.start_time).toBe('0');
  });

  it('should populate tournament', async () => {
    const output = await Vod.findById(vod.id).populate('tournament');

    expect(isDocument(output?.platform)).toBe(false);
    expect(isDocument(output?.tournament)).toBe(true);
    if (isDocument(output?.tournament)) {
      expect(output?.tournament.id).toBe(tournaments[0].id);
    }
  });

  it('should populate platform', async () => {
    const output = await Vod.findById(vod.id).populate('platform');
    expect(isDocument(output?.platform)).toBe(true);
    expect(isDocument(output?.tournament)).toBe(false);
    if (isDocument(output?.platform)) {
      expect(output?.platform.id).toBe(platforms[0].id);
    }
  });

  it('should populate all fields', async () => {
    const output = await Vod.findById(vod.id)
      .populate('tournament')
      .populate('platform');

    expect(isDocument(output?.platform)).toBe(true);
    expect(isDocument(output?.tournament)).toBe(true);
    if (isDocument(output?.platform) && isDocument(output?.tournament)) {
      expect(output?.platform.id).toBe(platforms[0].id);
      expect(output?.tournament.id).toBe(tournaments[0].id);
    }
  });

  it('should not validate if url not valid', async () => {
    const input = new Vod({
      ...vodFull,
      url: 'not-valid-url',
    });

    input.validate((error) => {
      expect(error.errors.url.message).toBe(
        generateValidationMessage(
          'url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if url not correct type', async () => {
    const input = new Vod({
      ...vodFull,
      url: 1993,
    });

    input.validate((error) => {
      expect(error.errors.url.message).toBe(
        generateValidationMessage(
          'url',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });
});
