import { default as faker } from 'faker';
import { Character, ICharacter } from '@models/character';
import { Game } from '@models/game';

describe('Character model test', () => {
  let games: Array<Game>;
  let characterFull: ICharacter;
  let characterMin: ICharacter;

  beforeAll(async () => {
    games = await Game.find().limit(2);

    characterFull = {
      game: games[0]._id,
      name: faker.name.findName(),
      short: faker.name.firstName(),
      image: faker.image.avatar(),
    };

    characterMin = {
      game: games[1]._id,
      name: faker.name.findName(),
      short: faker.name.firstName(),
    };
  });

  it('should create & save character successfully', async () => {
    const input = new Character(characterFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.game.toString()).toBe(characterFull.game.toString());
    expect(output.game.toString()).toBe(games[0]._id.toString());
    expect(output.name).toBe(characterFull.name);
    expect(output.short).toBe(characterFull.short);
    expect(output.image).toBe(characterFull.image);

    // shouldn't populate virtuals
    expect(output._game).toBeUndefined();
  });

  it('create & save minimum character successfully', async () => {
    const input = new Character(characterMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.game.toString()).toBe(characterMin.game.toString());
    expect(output.game.toString()).toBe(games[1]._id.toString());
    expect(output.name).toBe(characterMin.name);
    expect(output.short).toBe(characterMin.short);
    expect(output.image).toBeUndefined();

    // shouldn't populate virtuals
    expect(output._game).toBeUndefined();
  });

  it('should populate game', async () => {
    const output = await Character.findOne().populate('_game');
    expect(output?._game).toBeDefined();
  });
});
