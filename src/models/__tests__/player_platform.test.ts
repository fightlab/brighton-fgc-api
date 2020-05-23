import { DocumentType, isDocument } from '@typegoose/typegoose';
import { PlayerPlatformClass, PlayerPlatform } from '@models/player_platform';
import {
  BracketPlatformClass,
  BracketPlatform,
} from '@models/bracket_platform';
import { PlayerClass, Player } from '@models/player';

describe('PlayerPlatform model test', () => {
  let platforms: Array<DocumentType<BracketPlatformClass>>;
  let players: Array<DocumentType<PlayerClass>>;

  let playerPlatformFull: PlayerPlatformClass;
  let playerPlatformMin: PlayerPlatformClass;
  let playerPlatform: DocumentType<PlayerPlatformClass>;

  beforeEach(async () => {
    // fake some platforms
    platforms = await BracketPlatform.create([
      {
        name: 'HBK Tournaments',
        url: 'https://hbk.gg',
        api_url: 'https://api.hbk.gg',
      },
      {
        name: 'Pen & Paper',
      },
    ] as Array<BracketPlatformClass>);

    // fake some players
    players = await Player.create([
      {
        handle: 'Player 0',
      },
      {
        handle: 'Player 1',
      },
    ] as Array<PlayerClass>);

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
    [playerPlatform] = await PlayerPlatform.create([
      playerPlatformFull,
    ] as Array<PlayerPlatformClass>);
  });

  it('should create & save a player platform successfully', async () => {
    const input = new PlayerPlatform(playerPlatformFull);
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
    const input = new PlayerPlatform(playerPlatformMin);
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
    const output = await PlayerPlatform.findById(playerPlatform.id).populate(
      'platform',
    );

    expect(isDocument(output?.platform)).toBe(true);
    expect(isDocument(output?.player)).toBe(false);
    if (isDocument(output?.platform)) {
      expect(output?.platform.id).toBe(platforms[0].id);
    }
  });

  it('should populate player', async () => {
    const output = await PlayerPlatform.findById(playerPlatform.id).populate(
      'player',
    );

    expect(isDocument(output?.platform)).toBe(false);
    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.player)) {
      expect(output?.player.id).toBe(players[0].id);
    }
  });

  it('should populate all fields', async () => {
    const output = await PlayerPlatform.findById(playerPlatform.id)
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
