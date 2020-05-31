import { Resolver, Query, Ctx, Arg, FieldResolver, Root } from 'type-graphql';
import { ObjectId } from 'mongodb';
import {
  PlayerSocial,
  PLAYER_SOCIAL_DESCRIPTIONS,
} from '@models/player_social';
import { Context } from '@lib/graphql';
import { generateMongooseQueryObject } from '@graphql/resolvers';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { DocumentType } from '@typegoose/typegoose';
import { Player } from '@models/player';

// class used to share methods to other resolvers, use static methods
export class PlayerSocialResolverMethods {
  // get a single player social by player
  static async player_social({
    player,
    ctx,
  }: {
    player: ObjectId;
    ctx: Context;
  }) {
    const q = generateMongooseQueryObject();
    q.player = player;

    // found a result, so return the first one
    // nothing found, return null
    const [results = null] = await ctx.loaders.PlayerSocialsLoader.load(q);
    return results;
  }
}

@Resolver(() => PlayerSocial)
export class PlayerSocialResolver {
  @Query(() => PlayerSocial, {
    nullable: true,
    description: PLAYER_SOCIAL_DESCRIPTIONS.FIND_ONE,
  })
  player_social(
    @Arg('player', () => ObjectIdScalar, {
      description: PLAYER_SOCIAL_DESCRIPTIONS.PLAYER,
    })
    player: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return PlayerSocialResolverMethods.player_social({ player, ctx });
  }

  // add field onto player social to return the player_id
  @FieldResolver(() => ObjectIdScalar, {
    description: PLAYER_SOCIAL_DESCRIPTIONS.PLAYER_ID,
  })
  player_id(@Root() player_social: DocumentType<PlayerSocial>) {
    return player_social.player;
  }

  // field resolver for the player
  @FieldResolver(() => Player, {
    description: PLAYER_SOCIAL_DESCRIPTIONS.PLAYER,
  })
  player(
    @Root() player_social: DocumentType<PlayerSocial>,
    @Ctx() ctx: Context,
  ) {
    return ctx.loaders.PlayerLoader.load(player_social.player);
  }
}
