import { GameElo, IGameElo } from '@models/game_elo';
import { Game, IGame } from '@models/game';
import { Player, IPlayer } from '@models/player';

describe('GameElo model test', () => {
  let game: Game | null;
  let player: Player | null;
  let gameElo: IGameElo;

  beforeEach(async () => {
    // fake a game
    [game] = await Game.create([
      {
        name: 'Game 1',
        short: 'G1',
      },
    ] as Array<IGame>);
    [player] = await Player.create([
      {
        handle: 'xXx_Ep1c-G4m3r_xXx',
      },
    ] as Array<IPlayer>);

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
    expect(output.player.toString()).toBe(gameElo.player.toString());
    expect(output.player.toString()).toBe(player?._id.toString());
    expect(output.game.toString()).toBe(gameElo.game.toString());
    expect(output.game.toString()).toBe(game?._id.toString());
    expect(output.score).toBe(gameElo.score);

    // should not populate virtuals
    expect(output._game).toBeUndefined();
    expect(output._player).toBeUndefined();
  });

  it('should populate game', async () => {
    const input = await new GameElo(gameElo).save();
    const output = await GameElo.findById(input.id).populate('_game');
    expect(output?._game).toBeDefined();
    expect(output?._game?.id).toBe(game?.id);
    expect(output?._player).toBeUndefined();
  });

  it('should populate player', async () => {
    const input = await new GameElo(gameElo).save();
    const output = await GameElo.findById(input.id).populate('_player');
    expect(output?._game).toBeUndefined();
    expect(output?._player).toBeDefined();
    expect(output?._player?.id).toBe(player?.id);
  });

  it('should populate game and player', async () => {
    const input = await new GameElo(gameElo).save();
    const output = await GameElo.findById(input.id)
      .populate('_game')
      .populate('_player');
    expect(output?._game).toBeDefined();
    expect(output?._game?.id).toBe(game?.id);
    expect(output?._player).toBeDefined();
    expect(output?._player?.id).toBe(player?.id);
  });
});
