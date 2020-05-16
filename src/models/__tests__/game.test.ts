import { Game, IGame } from '@models/game';

describe('Game model test', () => {
  const gameData: IGame = {
    name: 'Persona 5 Arena',
    short: 'P5A',
  };

  it('create & save user successfully', async () => {
    const validGame = new Game(gameData);
    const savedGame = await validGame.save();

    expect(savedGame._id).toBeDefined();
    expect(savedGame.name).toBe(gameData.name);
    expect(savedGame.short).toBe(gameData.short);
  });
});
