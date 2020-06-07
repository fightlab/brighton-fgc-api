// GraphQL Resolver for Bracket Platforms

import {
  Resolver,
  Query,
  Ctx,
  registerEnumType,
  ArgsType,
  Field,
  Args,
  FieldResolver,
  Root,
} from 'type-graphql';
import { orderBy } from 'lodash';
import { ObjectId } from 'mongodb';
import {
  BracketPlatform,
  BRACKET_PLATFORM_DESCRIPTIONS,
} from '@models/bracket_platform';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { Context, CtxWithArgs } from '@lib/graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { Bracket, BRACKET_DESCRIPTIONS } from '@models/bracket';
import { DocumentType } from '@typegoose/typegoose';
import {
  BracketResolverMethods,
  BracketsArgs,
} from '@graphql/resolvers/bracket';

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

// arguments for bracket platform
@ArgsType()
export class BracketPlatformArgs {
  @Field(() => ObjectIdScalar, {
    description: BRACKET_PLATFORM_DESCRIPTIONS.ID,
  })
  id!: ObjectId;
}

// arguments for bracket platforms
@ArgsType()
export class BracketPlatformsArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: BRACKET_PLATFORM_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field({
    nullable: true,
  })
  search?: string;

  @Field(() => BRACKET_PLATFORM_SORT, {
    nullable: true,
    defaultValue: BRACKET_PLATFORM_SORT.NAME_ASC,
  })
  sort!: BRACKET_PLATFORM_SORT;
}

export class BracketPlatformResolverMethods {
  static bracket_platform({
    args: { id },
    ctx,
  }: CtxWithArgs<BracketPlatformArgs>): Promise<BracketPlatform | null> {
    return ctx.loaders.BracketPlatformLoader.load(id);
  }

  static async bracket_platforms({
    args: { sort, ids, search },
    ctx,
  }: CtxWithArgs<BracketPlatformsArgs>): Promise<Array<BracketPlatform>> {
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
}

@Resolver(() => BracketPlatform)
export class BracketPlatformResolver {
  // get single platform
  @Query(() => BracketPlatform, {
    nullable: true,
    description: BRACKET_PLATFORM_DESCRIPTIONS.FIND_ONE,
  })
  bracket_platform(
    @Args() { id }: BracketPlatformArgs,
    @Ctx() ctx: Context,
  ): Promise<BracketPlatform | null> {
    return BracketPlatformResolverMethods.bracket_platform({
      args: { id },
      ctx,
    });
  }

  // get multiple platforms
  @Query(() => [BracketPlatform], {
    description: BRACKET_PLATFORM_DESCRIPTIONS.FIND,
  })
  bracket_platforms(
    @Args() { ids, search, sort }: BracketPlatformsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<BracketPlatform>> {
    return BracketPlatformResolverMethods.bracket_platforms({
      ctx,
      args: { sort, ids, search },
    });
  }

  // brackets that belong to each platform
  @FieldResolver(() => [Bracket], {
    description: BRACKET_DESCRIPTIONS.DESCRIPTION,
  })
  brackets(
    @Root() bracket_platform: DocumentType<BracketPlatform>,
    @Args() { sort, ids, platform_id, slug, tournaments }: BracketsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Bracket>> {
    return BracketResolverMethods.brackets({
      ctx,
      args: {
        bracket_platform: bracket_platform._id,
        sort,
        ids,
        platform_id,
        slug,
        tournaments,
      },
    });
  }
}
