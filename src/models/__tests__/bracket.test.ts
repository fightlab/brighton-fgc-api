import { DocumentType, isDocument } from '@typegoose/typegoose';
import { default as faker } from 'faker';
import { default as moment } from 'moment';
import { Types } from 'mongoose';
import { Bracket, BracketClass } from '@models/bracket';
import {
  Tournament,
  TournamentClass,
  TOURNAMENT_TYPE,
} from '@models/tournament';
import {
  BracketPlatform,
  BracketPlatformClass,
} from '@models/bracket_platform';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

describe('Bracket model test', () => {
  let tournaments: Array<DocumentType<TournamentClass>>;
  let platforms: Array<DocumentType<BracketPlatformClass>>;
  let bracketFull: BracketClass;
  let bracketMin: BracketClass;
  let bracket: DocumentType<BracketClass>;

  // adding to before each is the only way to guarantee documents available
  // since collections are cleared after each test
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
        date_start: moment.utc().add(1, 'd').toDate(),
        event: new Types.ObjectId(),
        games: [new Types.ObjectId()],
        type: TOURNAMENT_TYPE.ROUND_ROBIN,
        is_team_based: true,
      },
    ] as Array<TournamentClass>);

    // fake some platforms
    platforms = await BracketPlatform.create([
      {
        name: 'HBK Tournaments',
        url: 'https://hbk.gg',
        api_url: 'https://api.hbk.gg',
      },
      {
        name: 'Pen & Paper',
      },
    ] as Array<BracketPlatformClass>);

    const uuidFull = faker.random.uuid().split('-')[0];
    bracketFull = {
      platform: platforms[0]._id,
      tournament: tournaments[0]._id,
      platform_id: uuidFull,
      url: `${platforms[0]?.url}/${uuidFull}`,
      slug: faker.lorem.slug(),
      image: faker.image.image(),
    };

    bracketMin = {
      platform: platforms[1]._id,
      tournament: tournaments[1]._id,
      platform_id: 'N/A',
    };

    // add a tournament bracket to the collection
    const bracketUuid = faker.random.uuid().split('-')[0];
    [bracket] = await Bracket.create([
      {
        platform: platforms[0]._id,
        tournament: tournaments[0]._id,
        platform_id: bracketUuid,
        slug: faker.lorem.slug(),
        url: `${platforms[0]?.url}/${bracketUuid}`,
      },
    ] as Array<BracketClass>);
  });

  it('create & save bracket successfully', async () => {
    const input = new Bracket(bracketFull);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output.tournament)).toBe(false);
    expect(isDocument(output.platform)).toBe(false);

    expect(output.platform?.toString()).toBe(bracketFull.platform?.toString());
    expect(output.platform?.toString()).toBe(platforms[0]._id.toString());
    expect(output.tournament?.toString()).toBe(
      bracketFull.tournament?.toString(),
    );
    expect(output.tournament?.toString()).toBe(tournaments[0]._id.toString());
    expect(output.platform_id).toBe(bracketFull.platform_id);
    expect(output.url).toBe(bracketFull.url);
    expect(output.slug).toBe(bracketFull.slug);
    expect(output.image).toBe(bracketFull.image);
  });

  it('create & save minimum bracket successfully', async () => {
    const input = new Bracket(bracketMin);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output.tournament)).toBe(false);
    expect(isDocument(output.platform)).toBe(false);

    expect(output.platform?.toString()).toBe(bracketMin.platform?.toString());
    expect(output.platform?.toString()).toBe(platforms[1]._id.toString());
    expect(output.tournament?.toString()).toBe(
      bracketMin.tournament?.toString(),
    );
    expect(output.tournament?.toString()).toBe(tournaments[1]._id.toString());
    expect(output.platform_id).toBe(bracketMin.platform_id);
    expect(output.url).toBe(bracketMin.url);
    expect(output.slug).toBe(bracketMin.slug);
    expect(output.image).toBeUndefined();
  });

  it('should populate platform', async () => {
    const output = await Bracket.findById(bracket.id).populate('platform');

    expect(isDocument(output?.platform)).toBe(true);
    expect(isDocument(output?.tournament)).toBe(false);
    if (isDocument(output?.platform)) {
      expect(output?.platform.id).toBe(platforms[0].id);
    }
  });

  it('should populate tournament', async () => {
    const output = await Bracket.findById(bracket.id).populate('tournament');

    expect(isDocument(output?.platform)).toBe(false);
    expect(isDocument(output?.tournament)).toBe(true);
    if (isDocument(output?.tournament)) {
      expect(output?.tournament.id).toBe(tournaments[0].id);
    }
  });

  it('should populate platform and tournament', async () => {
    const output = await Bracket.findById(bracket.id)
      .populate('platform')
      .populate('tournament');

    expect(isDocument(output?.platform)).toBe(true);
    expect(isDocument(output?.tournament)).toBe(true);
    if (isDocument(output?.platform) && isDocument(output?.tournament)) {
      expect(output?.platform.id).toBe(platforms[0].id);
      expect(output?.tournament.id).toBe(tournaments[0].id);
    }
  });

  it('should not validate if url not valid', async () => {
    const input = new Bracket({
      ...bracketFull,
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
    const input = new Bracket({
      ...bracketFull,
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
