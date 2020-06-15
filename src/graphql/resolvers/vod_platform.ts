import {
  registerEnumType,
  ArgsType,
  Field,
  Resolver,
  Query,
  Args,
  Ctx,
} from 'type-graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { VOD_PLATFORM_DESCRIPTIONS, VodPlatform } from '@models/vod_platform';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';

enum VOD_PLATFORM_SORT {
  NAME_ASC,
  NAME_DESC,
  ID,
}

registerEnumType(VOD_PLATFORM_SORT, {
  name: 'VodPlatformSort',
  description: 'Sort VOD platforms by this enum',
});

const mapSort = (sort: VOD_PLATFORM_SORT): MapSort => {
  switch (sort) {
    case VOD_PLATFORM_SORT.NAME_ASC:
      return ['name', 'asc'];
    case VOD_PLATFORM_SORT.NAME_DESC:
      return ['name', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

@ArgsType()
export class VodPlatformArgs {
  @Field(() => ObjectIdScalar, {
    description: VOD_PLATFORM_DESCRIPTIONS.ID,
  })
  id!: ObjectId;
}

@ArgsType()
export class VodPlatformsArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: VOD_PLATFORM_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field({
    nullable: true,
  })
  search?: string;

  @Field(() => VOD_PLATFORM_SORT, {
    nullable: true,
    defaultValue: VOD_PLATFORM_SORT.NAME_ASC,
  })
  sort!: VOD_PLATFORM_SORT;
}

export class VodPlatformResolverMethods {
  static vod_platform({
    args: { id },
    ctx,
  }: CtxWithArgs<VodPlatformArgs>): Promise<VodPlatform | null> {
    return ctx.loaders.VodPlatformLoader.load(id);
  }

  static async vod_platforms({
    args: { sort, ids, search },
    ctx,
  }: CtxWithArgs<VodPlatformsArgs>): Promise<Array<VodPlatform>> {
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

    const platforms = await ctx.loaders.VodPlatformsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(platforms, iteratee, orders);
  }
}

@Resolver(() => VodPlatform)
export class VodPlatformResolver {
  // get single platform
  @Query(() => VodPlatform, {
    nullable: true,
    description: VOD_PLATFORM_DESCRIPTIONS.FIND_ONE,
  })
  vod_platform(
    @Args() { id }: VodPlatformArgs,
    @Ctx() ctx: Context,
  ): Promise<VodPlatform | null> {
    return VodPlatformResolverMethods.vod_platform({
      args: { id },
      ctx,
    });
  }

  // get multiple platforms
  @Query(() => [VodPlatform], {
    description: VOD_PLATFORM_DESCRIPTIONS.FIND,
  })
  vod_platforms(
    @Args() { ids, search, sort }: VodPlatformsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<VodPlatform>> {
    return VodPlatformResolverMethods.vod_platforms({
      ctx,
      args: { sort, ids, search },
    });
  }
}
