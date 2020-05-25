// GraphQL Resolver for Bracket Platforms

import { Resolver, Query, Arg, Ctx } from 'type-graphql';
import {
  BracketPlatform,
  BRACKET_PLATFORM_DESCRIPTIONS,
} from '@models/bracket_platform';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { Context } from '@lib/graphql';

@Resolver(() => BracketPlatform)
export class BracketPlatformResolver {
  @Query(() => BracketPlatform, {
    nullable: true,
    description: BRACKET_PLATFORM_DESCRIPTIONS.FIND_ONE,
  })
  bracket_platform(
    @Arg('id', () => ObjectIdScalar, {
      description: BRACKET_PLATFORM_DESCRIPTIONS.ID,
    })
    id: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return ctx.loaders.BracketPlatformLoader.load(id);
  }

  @Query(() => [BracketPlatform], {
    description: BRACKET_PLATFORM_DESCRIPTIONS.FIND,
  })
  bracket_platforms(@Ctx() ctx: Context) {
    // for future querying
    const q = {};
    return ctx.loaders.BracketPlatformsLoader.load(q);
  }
}
