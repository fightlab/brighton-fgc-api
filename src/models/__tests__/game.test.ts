import { Game, IGame } from '@models/game';

describe('Game model test', () => {
  const gameMin: IGame = {
    name: 'Persona 5 Arena',
    short: 'P5A',
  };

  it('create & save game successfully', async () => {
    const input = new Game(gameMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(gameMin.name);
    expect(output.short).toBe(gameMin.short);
  });
});
