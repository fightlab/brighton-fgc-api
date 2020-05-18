import { default as faker } from 'faker';
import { Bracket, IBracket } from '@models/bracket';
import { Tournament } from '@models/tournament';
import { BracketPlatform } from '@models/bracket_platform';

describe('Bracket model test', () => {
  let tournaments: Array<Tournament>;
  let platforms: Array<BracketPlatform>;
  let bracketFull: IBracket;
  let bracketMin: IBracket;

  beforeAll(async () => {
    tournaments = await Tournament.find().limit(2);
    platforms = await BracketPlatform.find().limit(2);

    const uuidFull = faker.random.uuid().split('-')[0];
    bracketFull = {
      platform: platforms[0]._id,
      tournament: tournaments[0]._id,
      platform_id: uuidFull,
      url: `${platforms[0]?.url}/${uuidFull}`,
      slug: faker.lorem.slug(),
      image: faker.image.image(),
    };

    const uuidMin = faker.random.uuid().split('-')[0];
    bracketMin = {
      platform: platforms[1]._id,
      tournament: tournaments[1]._id,
      platform_id: uuidMin,
      url: `${platforms[1]?.url}/${uuidMin}`,
      slug: faker.lorem.slug(),
    };
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
    const output = await Bracket.findOne().populate('_platform');
    expect(output?._platform).toBeDefined();
    expect(output?._tournament).toBeUndefined();
  });

  it('should populate tournament', async () => {
    const output = await Bracket.findOne().populate('_tournament');
    expect(output?._tournament).toBeDefined();
    expect(output?._platform).toBeUndefined();
  });

  it('should populate platform and tournament', async () => {
    const output = await Bracket.findOne()
      .populate('_platform')
      .populate('_tournament');
    expect(output?._platform).toBeDefined();
    expect(output?._tournament).toBeDefined();
  });
});
