import { DocumentType } from '@typegoose/typegoose';
import { Player, PlayerModel } from '@models/player';
import { PlayerSocial, PlayerSocialModel } from '@models/player_social';
import {
  generatePlayer,
  generatePlayerSocial,
} from '@graphql/resolvers/test/generate';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { ObjectId } from 'mongodb';
import { CreateQuery } from 'mongoose';

describe('Player social GraphQL Resolver Test', () => {
  let players: Array<DocumentType<Player>>;
  let playerSocials: Array<DocumentType<PlayerSocial>>;

  beforeEach(async () => {
    players = await PlayerModel.create(
      Array.from(
        {
          length: 2,
        },
        () => generatePlayer(true),
      ),
    );

    playerSocials = await PlayerSocialModel.create([
      generatePlayerSocial(players[0]._id, 'full'),
      generatePlayerSocial(players[1]._id, 'min'),
    ] as CreateQuery<PlayerSocial>[]);
  });

  it('should return a single player social for a given player', async () => {
    const source = gql`
      query SelectPlayerSocial($player: ObjectId!) {
        player_social(player: $player) {
          _id
          player_id
        }
      }
    `;

    const variableValues = {
      player: playerSocials[1].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data?.player_social).toBeDefined();
    expect(output.data?.player_social._id).toBe(playerSocials[1].id);
    expect(output.data?.player_social.player_id).toBe(
      playerSocials[1].player?.toString(),
    );
    expect(output.data?.player_social.player_id).toBe(players[1].id);
  });

  it('should return all social fields for a given player', async () => {
    const source = gql`
      query SelectPlayerSocial($player: ObjectId!) {
        player_social(player: $player) {
          _id
          player_id
          facebook
          web
          twitter
          discord
          instagram
          github
          twitch
          youtube
          playstation
          xbox
          switch
        }
      }
    `;

    const variableValues = {
      player: playerSocials[0].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data?.player_social).toBeDefined();
    expect(output.data?.player_social._id).toBe(playerSocials[0].id);
    expect(output.data?.player_social.facebook).toBe(playerSocials[0].facebook);
    expect(output.data?.player_social.web).toBe(playerSocials[0].web);
    expect(output.data?.player_social.twitter).toBe(playerSocials[0].twitter);
    expect(output.data?.player_social.discord).toBe(playerSocials[0].discord);
    expect(output.data?.player_social.instagram).toBe(
      playerSocials[0].instagram,
    );
    expect(output.data?.player_social.github).toBe(playerSocials[0].github);
    expect(output.data?.player_social.twitch).toBe(playerSocials[0].twitch);
    expect(output.data?.player_social.youtube).toBe(playerSocials[0].youtube);
    expect(output.data?.player_social.playstation).toBe(
      playerSocials[0].playstation,
    );
    expect(output.data?.player_social.xbox).toBe(playerSocials[0].xbox);
    expect(output.data?.player_social.switch).toBe(playerSocials[0].switch);
  });

  it('should populate player for a given player social by player (weird, but yeah)', async () => {
    const source = gql`
      query SelectPlayerSocial($player: ObjectId!) {
        player_social(player: $player) {
          _id
          player {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      player: playerSocials[1].player?.toString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data?.player_social).toBeDefined();
    expect(output.data?.player_social.player).toBeDefined();
    expect(output.data?.player_social.player._id).toBe(players[1].id);
    expect(output.data?.player_social.player.handle).toBe(players[1].handle);
  });

  it('should return null if a player social is not found for a given player', async () => {
    const source = gql`
      query SelectPlayerSocial($player: ObjectId!) {
        player_social(player: $player) {
          _id
          player {
            _id
            handle
          }
        }
      }
    `;

    const variableValues = {
      player: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data?.player_social).toBeNull();
  });
});
