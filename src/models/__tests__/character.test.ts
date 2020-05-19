import { default as faker } from 'faker';
import { Character, ICharacter } from '@models/character';
import { Game, IGame } from '@models/game';

describe('Character model test', () => {
  let games: Array<Game>;
  let characterFull: ICharacter;
  let characterMin: ICharacter;
  let character: Character;

  beforeEach(async () => {
    // fake some games
    games = await Game.create([
      {
        name: 'Game #1',
        short: 'G1',
      },
      {
        name: 'Game #2',
        short: 'G2',
      },
    ] as Array<IGame>);

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

    [character] = await Character.create([
      {
        game: games[0]._id,
        name: 'Another Waifu',
        short: 'WAIFU',
      },
    ] as Array<ICharacter>);
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
    const output = await Character.findById(character._id).populate('_game');
    expect(output?._game).toBeDefined();
    expect(output?._game?.id).toBe(games[0].id);
  });
});
