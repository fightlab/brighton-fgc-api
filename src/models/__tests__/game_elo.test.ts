import { GameElo, IGameElo } from '@models/game_elo';
import { Game } from '@models/game';
import { Player } from '@models/player';

describe('GameElo model test', () => {
  let game: Game | null;
  let player: Player | null;
  let gameElo: IGameElo;

  beforeAll(async () => {
    game = await Game.findOne();
    player = await Player.findOne();

    gameElo = {
      game: game?._id,
      player: player?._id,
      score: 1000,
    };
  });

  it('should create & save gameElo successfully', async () => {
    const input = new GameElo(gameElo);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // should not populate virtuals
    expect(output._game).toBeUndefined();
    expect(output._player).toBeUndefined();
  });

  it('should populate game', async () => {
    const output = await GameElo.findOne().populate('_game');
    expect(output?._game).toBeDefined();
    expect(output?._player).toBeUndefined();
  });

  it('should populate game', async () => {
    const output = await GameElo.findOne().populate('_player');
    expect(output?._game).toBeUndefined();
    expect(output?._player).toBeDefined();
  });

  it('should populate game and player', async () => {
    const output = await GameElo.findOne()
      .populate('_game')
      .populate('_player');
    expect(output?._game).toBeDefined();
    expect(output?._player).toBeDefined();
  });
});
