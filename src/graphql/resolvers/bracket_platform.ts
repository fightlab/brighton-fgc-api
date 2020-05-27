// GraphQL Resolver for Bracket Platforms

import { Resolver, Query, Arg, Ctx, registerEnumType } from 'type-graphql';
import { orderBy } from 'lodash';
import { ObjectId } from 'mongodb';
import {
  BracketPlatform,
  BRACKET_PLATFORM_DESCRIPTIONS,
} from '@models/bracket_platform';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { Context } from '@lib/graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';

// sorting stuff for character
enum BRACKET_PLATFORM_SORT {
  NAME_ASC,
  NAME_DESC,
  ID,
}

// register the enum with graphql
registerEnumType(BRACKET_PLATFORM_SORT, {
  name: 'BracketPlatformSort',
  description: 'Sort platforms by this enum',
});

// turn sort into an array usable by lodash
const mapSort = (sort: BRACKET_PLATFORM_SORT): MapSort => {
  switch (sort) {
    case BRACKET_PLATFORM_SORT.NAME_ASC:
      return ['name', 'asc'];
    case BRACKET_PLATFORM_SORT.NAME_DESC:
      return ['name', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

@Resolver(() => BracketPlatform)
export class BracketPlatformResolver {
  // get single platform
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

  // get multiple platforms
  @Query(() => [BracketPlatform], {
    description: BRACKET_PLATFORM_DESCRIPTIONS.FIND,
  })
  async bracket_platforms(
    @Arg('ids', () => [ObjectIdScalar], {
      nullable: true,
      description: BRACKET_PLATFORM_DESCRIPTIONS.IDS,
    })
    ids: Array<ObjectId>,
    @Arg('search', {
      nullable: true,
    })
    search: string,
    @Arg('sort', () => BRACKET_PLATFORM_SORT, {
      nullable: true,
      defaultValue: BRACKET_PLATFORM_SORT.NAME_ASC,
    })
    sort: BRACKET_PLATFORM_SORT,
    @Ctx() ctx: Context,
  ) {
    const q = generateMongooseQueryObject();

    if (search) {
      q.name = {
        $regex: `${search}`,
        $options: 'i',
      } as MongooseQuery;
    }

    if (ids) {
      q._id = {
        $in: ids,
      } as MongooseQuery;
    }

    const platforms = await ctx.loaders.BracketPlatformsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(platforms, iteratee, orders);
  }

  // TODO: Add brackets that belong to each platform
}
