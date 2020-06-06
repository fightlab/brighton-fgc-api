import {
  Resolver,
  Query,
  Ctx,
  FieldResolver,
  Root,
  ArgsType,
  Field,
  Args,
} from 'type-graphql';
import { ObjectId } from 'mongodb';
import {
  PlayerSocial,
  PLAYER_SOCIAL_DESCRIPTIONS,
} from '@models/player_social';
import { Context, CtxWithArgs } from '@lib/graphql';
import { generateMongooseQueryObject } from '@graphql/resolvers';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { DocumentType } from '@typegoose/typegoose';
import { Player } from '@models/player';
import { PlayerResolverMethods } from '@graphql/resolvers/player';

@ArgsType()
export class PlayerSocialArgs {
  @Field(() => ObjectIdScalar, {
    description: PLAYER_SOCIAL_DESCRIPTIONS.PLAYER,
  })
  player!: ObjectId;
}

// class used to share methods to other resolvers, use static methods
export class PlayerSocialResolverMethods {
  // get a single player social by player
  static async player_social({
    args: { player },
    ctx,
  }: CtxWithArgs<PlayerSocialArgs>) {
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
  player_social(@Args() { player }: PlayerSocialArgs, @Ctx() ctx: Context) {
    return PlayerSocialResolverMethods.player_social({ args: { player }, ctx });
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
    return PlayerResolverMethods.player({
      args: { id: player_social.player as ObjectId },
      ctx,
    });
  }
}
