import { DocumentType, isDocument } from '@typegoose/typegoose';
import { GameEloModel, GameElo } from '@models/game_elo';
import { GameModel, Game } from '@models/game';
import { PlayerModel, Player } from '@models/player';

describe('GameElo model test', () => {
  let game: DocumentType<Game>;
  let player: DocumentType<Player>;
  let gameElo: GameElo;

  beforeEach(async () => {
    // fake a game
    [game] = await GameModel.create([
      {
        name: 'Game 1',
        short: 'G1',
      },
    ] as Array<Game>);
    [player] = await PlayerModel.create([
      {
        handle: 'xXx_Ep1c-G4m3r_xXx',
      },
    ] as Array<Player>);

    gameElo = {
      game: game?._id,
      player: player?._id,
      score: 1000,
    };
  });

  it('should create & save gameElo successfully', async () => {
    const input = new GameEloModel(gameElo);
    const output = await input.save();

    // shouldn't populate virtuals
    expect(isDocument(output.player)).toBe(false);
    expect(isDocument(output.game)).toBe(false);

    expect(output._id).toBeDefined();
    expect(output.player?.toString()).toBe(gameElo.player?.toString());
    expect(output.player?.toString()).toBe(player._id.toString());
    expect(output.game?.toString()).toBe(gameElo.game?.toString());
    expect(output.game?.toString()).toBe(game?._id.toString());
    expect(output.score).toBe(gameElo.score);
  });

  it('should populate game', async () => {
    const input = await new GameEloModel(gameElo).save();
    const output = await GameEloModel.findById(input.id).populate('game');

    expect(isDocument(output?.game)).toBe(true);
    expect(isDocument(output?.player)).toBe(false);
    if (isDocument(output?.game)) {
      expect(output?.game.id).toBe(game.id);
    }
  });

  it('should populate player', async () => {
    const input = await new GameEloModel(gameElo).save();
    const output = await GameEloModel.findById(input.id).populate('player');

    expect(isDocument(output?.game)).toBe(false);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.player)) {
      expect(output?.player.id).toBe(player.id);
    }
  });

  it('should populate game and player', async () => {
    const input = await new GameEloModel(gameElo).save();
    const output = await GameEloModel.findById(input.id)
      .populate('game')
      .populate('player');

    expect(isDocument(output?.game)).toBe(true);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.game) && isDocument(output?.player)) {
      expect(output?.game.id).toBe(game.id);
      expect(output?.player.id).toBe(player.id);
    }
  });
});
