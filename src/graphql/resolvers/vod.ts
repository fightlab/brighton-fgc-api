import {
  registerEnumType,
  ArgsType,
  Field,
  Resolver,
  Query,
  Args,
  Ctx,
  FieldResolver,
  Root,
} from 'type-graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { VOD_DESCRIPTIONS, Vod } from '@models/vod';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { Tournament } from '@models/tournament';
import { TournamentResolverMethods } from '@graphql/resolvers/tournament';
import { VodPlatform } from '@models/vod_platform';
import { VodPlatformResolverMethods } from '@graphql/resolvers/vod_platform';

// sort
export enum VOD_SORT {
  TOURNAMENT_ID,
  VOD_PLATFORM_ID,
  ID,
}

// register sort enum with gql
registerEnumType(VOD_SORT, {
  name: 'VodSort',
  description: 'Sort VODs by this enum',
});

// map sort to make it usable
export const mapSort = (sort: VOD_SORT): MapSort => {
  switch (sort) {
    case VOD_SORT.TOURNAMENT_ID:
      return ['tournament', 'asc'];
    case VOD_SORT.VOD_PLATFORM_ID:
      return ['platform', 'asc'];
    default:
      return ['_id', 'asc'];
  }
};

// single vod arg
@ArgsType()
export class VodArgs {
  @Field(() => ObjectIdScalar, {
    description: VOD_DESCRIPTIONS.ID,
    nullable: true,
  })
  id?: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: VOD_DESCRIPTIONS.TOURNAMENT_ID,
    nullable: true,
  })
  tournament?: ObjectId;
}

// multiple vod args
@ArgsType()
export class VodsArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: VOD_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: VOD_DESCRIPTIONS.TOURNAMENT_IDS,
  })
  tournaments?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: VOD_DESCRIPTIONS.VOD_PLATFORM_IDS,
  })
  vod_platforms?: Array<ObjectId>;

  @Field(() => VOD_SORT, {
    nullable: true,
    defaultValue: VOD_SORT.ID,
  })
  sort!: VOD_SORT;
}

// vod resolver methods
export class VodResolverMethods {
  static async vod({
    ctx,
    args: { id, tournament },
  }: CtxWithArgs<VodArgs>): Promise<Vod | null> {
    if (!id && !tournament) {
      return null;
    }

    // if id exists use the single loader by id
    if (id) {
      return ctx.loaders.VodLoader.load(id);
    }

    // at this point we need both tournament exists
    const q = generateMongooseQueryObject();
    q.tournament = tournament;

    // found a vod, so return the first one
    // nothing found, return null
    const [vod = null] = await ctx.loaders.VodsLoader.load(q);
    return vod;
  }

  static async vods({
    ctx,
    args: { sort, ids, tournaments, vod_platforms },
  }: CtxWithArgs<VodsArgs>): Promise<Array<Vod>> {
    const q = generateMongooseQueryObject();

    if (ids) {
      q._id = {
        $in: ids,
      } as MongooseQuery;
    }

    if (tournaments) {
      q.tournament = {
        $in: tournaments,
      } as MongooseQuery;
    }

    if (vod_platforms) {
      q.platform = {
        $in: vod_platforms,
      } as MongooseQuery;
    }

    const vods = await ctx.loaders.VodsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(vods, iteratee, orders);
  }
}

// vod resolver
@Resolver(() => Vod)
export class VodResolver {
  // get single vod by id, or tournament and player
  @Query(() => Vod, {
    nullable: true,
    description: VOD_DESCRIPTIONS.FIND_ONE,
  })
  vod(
    @Args() { id, tournament }: VodArgs,
    @Ctx() ctx: Context,
  ): Promise<Vod | null> {
    return VodResolverMethods.vod({
      ctx,
      args: {
        id,
        tournament,
      },
    });
  }

  // get multiple vods
  @Query(() => [Vod], {
    description: VOD_DESCRIPTIONS.FIND,
  })
  vods(
    @Args()
    { sort, ids, tournaments, vod_platforms }: VodsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Vod>> {
    return VodResolverMethods.vods({
      ctx,
      args: {
        sort,
        ids,
        tournaments,
        vod_platforms,
      },
    });
  }

  // tournament id field resovler
  @FieldResolver(() => ObjectIdScalar, {
    description: VOD_DESCRIPTIONS.TOURNAMENT_ID,
    nullable: true,
  })
  tournament_id(@Root() vod: DocumentType<Vod>): ObjectId {
    return vod.tournament as ObjectId;
  }

  // tournament field resolver
  @FieldResolver(() => Tournament, {
    description: VOD_DESCRIPTIONS.TOURNAMENT,
    nullable: true,
  })
  tournament(
    @Root() vod: DocumentType<Vod>,
    @Ctx() ctx: Context,
  ): Promise<Tournament | null> {
    return TournamentResolverMethods.tournament({
      ctx,
      args: { id: vod.tournament as ObjectId },
    });
  }

  // vod platform id field resovler
  @FieldResolver(() => ObjectIdScalar, {
    description: VOD_DESCRIPTIONS.VOD_PLATFORM_ID,
    nullable: true,
  })
  vod_platform_id(@Root() vod: DocumentType<Vod>): ObjectId {
    return vod.platform as ObjectId;
  }

  // vod platform field resolver
  @FieldResolver(() => VodPlatform, {
    nullable: true,
    description: VOD_DESCRIPTIONS.VOD_PLATFORM,
  })
  vod_platform(
    @Root() vod: DocumentType<Vod>,
    @Ctx() ctx: Context,
  ): Promise<VodPlatform | null> {
    return VodPlatformResolverMethods.vod_platform({
      ctx,
      args: { id: vod.platform as ObjectId },
    });
  }
}
