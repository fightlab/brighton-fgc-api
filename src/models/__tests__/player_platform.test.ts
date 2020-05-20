import { IPlayerPlatform, PlayerPlatform } from '@models/player_platform';
import { IBracketPlatform, BracketPlatform } from '@models/bracket_platform';
import { IPlayer, Player } from '@models/player';

describe('PlayerPlatform model test', () => {
  let platforms: Array<BracketPlatform>;
  let players: Array<Player>;

  let playerPlatformFull: IPlayerPlatform;
  let playerPlatformMin: IPlayerPlatform;
  let playerPlatform: PlayerPlatform;

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
    ] as Array<IBracketPlatform>);

    // fake some players
    players = await Player.create([
      {
        handle: 'Player 0',
      },
      {
        handle: 'Player 1',
      },
    ] as Array<IPlayer>);

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
    ] as Array<IPlayerPlatform>);
  });

  it('should create & save a player platform successfully', async () => {
    const input = new PlayerPlatform(playerPlatformFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.platform.toString()).toBe(
      playerPlatformFull.platform.toString(),
    );
    expect(output.platform.toString()).toBe(platforms[0].id);
    expect(output.player.toString()).toBe(playerPlatformFull.player.toString());
    expect(output.player.toString()).toBe(players[0].id);
    expect(output.email_hash).toBe(playerPlatformFull.email_hash);
    expect(output.platform_id).toBe(playerPlatformFull.platform_id);

    // shouldn't populate virtuals
    expect(output._platform).toBeUndefined();
    expect(output._player).toBeUndefined();
  });

  it('should create & save a min player platform successfully', async () => {
    const input = new PlayerPlatform(playerPlatformMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.platform.toString()).toBe(
      playerPlatformMin.platform.toString(),
    );
    expect(output.platform.toString()).toBe(platforms[1].id);
    expect(output.player.toString()).toBe(playerPlatformMin.player.toString());
    expect(output.player.toString()).toBe(players[1].id);
    expect(output.email_hash).toBeUndefined();
    expect(output.platform_id).toBeUndefined();

    // shouldn't populate virtuals
    expect(output._platform).toBeUndefined();
    expect(output._player).toBeUndefined();
  });

  it('should populate platform', async () => {
    const output = await PlayerPlatform.findById(playerPlatform.id).populate(
      '_platform',
    );

    expect(output?._platform).toBeDefined();
    expect(output?._platform?.id).toBe(platforms[0].id);

    expect(output?._player).toBeUndefined();
  });

  it('should populate player', async () => {
    const output = await PlayerPlatform.findById(playerPlatform.id).populate(
      '_player',
    );

    expect(output?._player).toBeDefined();
    expect(output?._player?.id).toBe(players[0].id);

    expect(output?._platform).toBeUndefined();
  });

  it('should populate all fields', async () => {
    const output = await PlayerPlatform.findById(playerPlatform.id)
      .populate('_platform')
      .populate('_player');

    expect(output?._platform).toBeDefined();
    expect(output?._platform?.id).toBe(platforms[0].id);

    expect(output?._player).toBeDefined();
    expect(output?._player?.id).toBe(players[0].id);
  });
});
