import { default as faker } from 'faker';
import { GameModel, Game } from '@models/game';

describe('Game model test', () => {
  const gameFull: Game = {
    name: 'Blade Arcus from Shining',
    short: 'BAFS',
    bg: faker.image.imageUrl(),
    logo: faker.image.imageUrl(),
    meta: {
      random: 'stuff',
    },
  };

  const gameMin: Game = {
    name: 'Persona 5 Arena',
    short: 'P5A',
  };

  it('create & save game successfully', async () => {
    const input = new GameModel(gameFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(gameFull.name);
    expect(output.short).toBe(gameFull.short);
    expect(output.bg).toBe(gameFull.bg);
    expect(output.logo).toBe(gameFull.logo);
    expect(output.meta).toBeDefined();
  });

  it('create & save minimum game successfully', async () => {
    const input = new GameModel(gameMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(gameMin.name);
    expect(output.short).toBe(gameMin.short);
    expect(output.bg).toBeUndefined();
    expect(output.logo).toBeUndefined();
    expect(output.meta).toBeUndefined();
  });
});
