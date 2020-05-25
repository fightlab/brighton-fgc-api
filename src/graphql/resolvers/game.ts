// GraphQL Resolver for Games

import { Resolver, Query, Arg, Ctx } from 'type-graphql';
import { Game, GAME_DESCRIPTIONS } from '@models/game';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { Context } from '@lib/graphql';

@Resolver(() => Game)
export class GameResolver {
  @Query(() => Game, {
    nullable: true,
    description: GAME_DESCRIPTIONS.FIND_ONE,
  })
  game(
    @Arg('id', () => ObjectIdScalar, {
      description: GAME_DESCRIPTIONS.ID,
    })
    id: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return ctx.loaders.GameLoader.load(id);
  }

  @Query(() => [Game], {
    description: GAME_DESCRIPTIONS.FIND,
  })
  games(@Ctx() ctx: Context) {
    // for future querying
    const q = {};
    return ctx.loaders.GamesLoader.load(q);
  }
}
