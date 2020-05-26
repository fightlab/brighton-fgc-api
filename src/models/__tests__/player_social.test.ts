import { DocumentType, isDocument } from '@typegoose/typegoose';
import { PlayerSocialModel, PlayerSocial } from '@models/player_social';
import { PlayerModel, Player } from '@models/player';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

describe('PlayerSocial model test', () => {
  let players: Array<DocumentType<Player>>;
  let playerSocialFull: PlayerSocial;
  let playerSocialMin: PlayerSocial;
  let playerSocial: DocumentType<PlayerSocial>;

  beforeEach(async () => {
    // fake some players
    players = await PlayerModel.create([
      {
        handle: 'Player 1',
      },
      {
        handle: 'Player 2',
      },
    ] as Array<Player>);

    playerSocialFull = {
      player: players[0]._id,
      facebook: 'player social facebook',
      twitch: 'player social twitch',
      discord: 'player social discord',
      instagram: 'player social instagram',
      twitter: 'player social twitter',
      web: 'https://player.social/web',
      youtube: 'player social youtube',
      github: 'player social github',
      playstation: 'player social playstation',
      switch: 'player social switch',
      xbox: 'player social xbox',
    };

    // not sure why you'd do this but /shrug
    playerSocialMin = {
      player: players[1]._id,
    };

    // add an player social to the collection
    [playerSocial] = await PlayerSocialModel.create([
      {
        player: players[0]._id,
      },
    ] as Array<PlayerSocial>);
  });

  it('should create & save playerSocial successfully', async () => {
    const input = new PlayerSocialModel(playerSocialFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.player?.toString()).toBe(playerSocialFull.player?.toString());
    expect(output.player?.toString()).toBe(players[0]._id.toString());
    expect(output.facebook).toBe(playerSocialFull.facebook);
    expect(output.twitch).toBe(playerSocialFull.twitch);
    expect(output.twitter).toBe(playerSocialFull.twitter);
    expect(output.discord).toBe(playerSocialFull.discord);
    expect(output.instagram).toBe(playerSocialFull.instagram);
    expect(output.web).toBe(playerSocialFull.web);
    expect(output.youtube).toBe(playerSocialFull.youtube);
    expect(output.github).toBe(playerSocialFull.github);
    expect(output.playstation).toBe(playerSocialFull.playstation);
    expect(output.switch).toBe(playerSocialFull.switch);
    expect(output.xbox).toBe(playerSocialFull.xbox);
  });

  it('should create & save min playerSocial successfully', async () => {
    const input = new PlayerSocialModel(playerSocialMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.player?.toString()).toBe(playerSocialMin.player?.toString());
    expect(output.player?.toString()).toBe(players[1]._id.toString());
    expect(output.facebook).toBeUndefined();
    expect(output.twitch).toBeUndefined();
    expect(output.twitter).toBeUndefined();
    expect(output.discord).toBeUndefined();
    expect(output.instagram).toBeUndefined();
    expect(output.web).toBeUndefined();
    expect(output.youtube).toBeUndefined();
    expect(output.github).toBeUndefined();
    expect(output.playstation).toBeUndefined();
    expect(output.switch).toBeUndefined();
    expect(output.xbox).toBeUndefined();
  });

  it('should populate player', async () => {
    const output = await PlayerSocialModel.findById(playerSocial.id).populate(
      'player',
    );

    expect(isDocument(output?.player)).toBe(true);
    if (isDocument(output?.player)) {
      expect(output?.player.id).toBe(players[0].id);
    }
  });

  it('should not validate if web not valid', async () => {
    const input = new PlayerSocialModel({
      ...playerSocialFull,
      web: 'not-valid-web',
    });

    input.validate((error) => {
      expect(error.errors.web.message).toBe(
        generateValidationMessage(
          'web',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if web not correct type', async () => {
    const input = new PlayerSocialModel({
      ...playerSocialFull,
      web: 1993,
    });

    input.validate((error) => {
      expect(error.errors.web.message).toBe(
        generateValidationMessage(
          'web',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });
});
