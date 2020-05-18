import { default as faker } from 'faker';
import { Game, IGame } from '@models/game';

describe('Game model test', () => {
  const gameFull: IGame = {
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
    const input = new Game(gameFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(gameFull.name);
    expect(output.short).toBe(gameFull.short);
    expect(output.bg).toBe(gameFull.bg);
    expect(output.logo).toBe(gameFull.logo);
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
