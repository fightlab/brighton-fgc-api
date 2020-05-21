import { default as faker } from 'faker';
import { default as moment } from 'moment';
import { Types } from 'mongoose';
import { Bracket, IBracket } from '@models/bracket';
import { Tournament, ITournament, TOURNAMENT_TYPE } from '@models/tournament';
import { BracketPlatform, IBracketPlatform } from '@models/bracket_platform';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@/lib/validation';

describe('Bracket model test', () => {
  let tournaments: Array<Tournament>;
  let platforms: Array<BracketPlatform>;
  let bracketFull: IBracket;
  let bracketMin: IBracket;
  let bracket: Bracket;

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
    ] as Array<ITournament>);

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
    ] as Array<IBracketPlatform>);

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
    ] as Array<IBracket>);
  });

  it('create & save bracket successfully', async () => {
    const input = new Bracket(bracketFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.platform.toString()).toBe(bracketFull.platform.toString());
    expect(output.platform.toString()).toBe(platforms[0]._id.toString());
    expect(output.tournament.toString()).toBe(
      bracketFull.tournament.toString(),
    );
    expect(output.tournament.toString()).toBe(tournaments[0]._id.toString());
    expect(output.platform_id).toBe(bracketFull.platform_id);
    expect(output.url).toBe(bracketFull.url);
    expect(output.slug).toBe(bracketFull.slug);
    expect(output.image).toBe(bracketFull.image);

    // shouldn't populate virtuals
    expect(output._platform).toBeUndefined();
    expect(output._tournament).toBeUndefined();
  });

  it('create & save minimum bracket successfully', async () => {
    const input = new Bracket(bracketMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.platform.toString()).toBe(bracketMin.platform.toString());
    expect(output.platform.toString()).toBe(platforms[1]._id.toString());
    expect(output.tournament.toString()).toBe(bracketMin.tournament.toString());
    expect(output.tournament.toString()).toBe(tournaments[1]._id.toString());
    expect(output.platform_id).toBe(bracketMin.platform_id);
    expect(output.url).toBe(bracketMin.url);
    expect(output.slug).toBe(bracketMin.slug);
    expect(output.image).toBeUndefined();

    // shouldn't populate virtuals
    expect(output._platform).toBeUndefined();
    expect(output._tournament).toBeUndefined();
  });

  it('should populate platform', async () => {
    const output = await Bracket.findById(bracket.id).populate('_platform');
    expect(output?._platform).toBeDefined();
    expect(output?._platform?.id).toBe(platforms[0].id);
    expect(output?._tournament).toBeUndefined();
  });

  it('should populate tournament', async () => {
    const output = await Bracket.findById(bracket.id).populate('_tournament');
    expect(output?._tournament).toBeDefined();
    expect(output?._tournament?.id).toBe(tournaments[0].id);
    expect(output?._platform).toBeUndefined();
  });

  it('should populate platform and tournament', async () => {
    const output = await Bracket.findById(bracket.id)
      .populate('_platform')
      .populate('_tournament');
    expect(output?._platform).toBeDefined();
    expect(output?._platform?.id).toBe(platforms[0].id);
    expect(output?._tournament).toBeDefined();
    expect(output?._tournament?.id).toBe(tournaments[0].id);
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
