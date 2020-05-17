import { Game, IGame } from '@models/game';
import { default as faker } from 'faker';

describe('Game model test', () => {
  const game: IGame = {
    name: 'Blade Arcus from Shining',
    short: 'BAFS',
    bg: faker.image.imageUrl(),
    logo: faker.image.imageUrl(),
    meta: {
      random: 'stuff',
    },
  };

  const gameMin: IGame = {
    name: 'Persona 5 Arena',
    short: 'P5A',
  };

  it('create & save game successfully', async () => {
    const input = new Game(game);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(game.name);
    expect(output.short).toBe(game.short);
    expect(output.bg).toBe(game.bg);
    expect(output.logo).toBe(game.logo);
    expect(output.meta).toBeDefined();
  });

  it('create & save minimum game successfully', async () => {
    const input = new Game(gameMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(gameMin.name);
    expect(output.short).toBe(gameMin.short);
    expect(output.bg).toBeUndefined();
    expect(output.logo).toBeUndefined();
    expect(output.meta).toBeUndefined();
  });
});
