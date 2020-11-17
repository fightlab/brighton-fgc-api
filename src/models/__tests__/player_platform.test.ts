import { DocumentType, isDocument } from '@typegoose/typegoose';
import { PlayerPlatform, PlayerPlatformModel } from '@models/player_platform';
import {
  BracketPlatform,
  BracketPlatformModel,
} from '@models/bracket_platform';
import { Player, PlayerModel } from '@models/player';
import { CreateQuery } from 'mongoose';

describe('PlayerPlatform model test', () => {
  let platforms: Array<DocumentType<BracketPlatform>>;
  let players: Array<DocumentType<Player>>;

  let playerPlatformFull: PlayerPlatform;
  let playerPlatformMin: PlayerPlatform;
  let playerPlatform: DocumentType<PlayerPlatform>;

  beforeEach(async () => {
    // fake some platforms
    platforms = await BracketPlatformModel.create([
      {
        name: 'HBK Tournaments',
        url: 'https://hbk.gg',
        api_url: 'https://api.hbk.gg',
      },
      {
        name: 'Pen & Paper',
      },
    ] as Array<BracketPlatform>);

    // fake some players
    players = await PlayerModel.create([
      {
        handle: 'Player 0',
      },
      {
        handle: 'Player 1',
      },
    ] as Array<Player>);

    playerPlatformFull = {
      platform: platforms[0]._id,
      player: players[0]._id,
      email_hash: 'hashed-email-md5',
      platform_id: 'platform-id',
    };

    playerPlatformMin = {
      platform: platforms[1]._id,
      player: players[1]._id,
    };

    // generate to test populate
    [playerPlatform] = await PlayerPlatformModel.create([
      playerPlatformFull,
    ] as CreateQuery<PlayerPlatform>[]);
  });

  it('should create & save a player platform successfully', async () => {
    const input = new PlayerPlatformModel(playerPlatformFull);
    const output = await input.save();

    // shouldn't populate virtuals
    expect(isDocument(output.player)).toBe(false);
    expect(isDocument(output.platform)).toBe(false);

    expect(output._id).toBeDefined();
    expect(output.platform?.toString()).toBe(
      playerPlatformFull.platform?.toString(),
    );
    expect(output.platform?.toString()).toBe(platforms[0].id);
    expect(output.player?.toString()).toBe(
      playerPlatformFull.player?.toString(),
    );
    expect(output.player?.toString()).toBe(players[0].id);
    expect(output.email_hash).toBe(playerPlatformFull.email_hash);
    expect(output.platform_id).toBe(playerPlatformFull.platform_id);
  });

  it('should create & save a min player platform successfully', async () => {
    const input = new PlayerPlatformModel(playerPlatformMin);
    const output = await input.save();

    // shouldn't populate virtuals
    expect(isDocument(output.player)).toBe(false);
    expect(isDocument(output.platform)).toBe(false);

    expect(output._id).toBeDefined();
    expect(output.platform?.toString()).toBe(
      playerPlatformMin.platform?.toString(),
    );
    expect(output.platform?.toString()).toBe(platforms[1].id);
    expect(output.player?.toString()).toBe(
      playerPlatformMin.player?.toString(),
    );
    expect(output.player?.toString()).toBe(players[1].id);
    expect(output.email_hash).toBeUndefined();
    expect(output.platform_id).toBeUndefined();
  });

  it('should populate platform', async () => {
    const output = await PlayerPlatformModel.findById(
      playerPlatform.id,
    ).populate('platform');

    expect(isDocument(output?.platform)).toBe(true);
    expect(isDocument(output?.player)).toBe(false);
    if (isDocument(output?.platform)) {
      expect(output?.platform.id).toBe(platforms[0].id);
    }
  });

  it('should populate player', async () => {
    const output = await PlayerPlatformModel.findById(
      playerPlatform.id,
    ).populate('player');

    expect(isDocument(output?.platform)).toBe(false);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.player)) {
      expect(output?.player.id).toBe(players[0].id);
    }
  });

  it('should populate all fields', async () => {
    const output = await PlayerPlatformModel.findById(playerPlatform.id)
      .populate('platform')
      .populate('player');

    expect(isDocument(output?.platform)).toBe(true);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.platform) && isDocument(output?.player)) {
      expect(output?.platform.id).toBe(platforms[0].id);
      expect(output?.player.id).toBe(players[0].id);
    }
  });
});
