import {
  Resolver,
  registerEnumType,
  ArgsType,
  Field,
  Ctx,
  Query,
  Args,
  FieldResolver,
  Root,
} from 'type-graphql';
import { Bracket, BRACKET_DESCRIPTIONS } from '@models/bracket';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { TOURNAMENT_DESCRIPTIONS, Tournament } from '@models/tournament';
import {
  BRACKET_PLATFORM_DESCRIPTIONS,
  BracketPlatform,
} from '@models/bracket_platform';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { BracketPlatformResolverMethods } from '@graphql/resolvers/bracket_platform';
import { TournamentResolverMethods } from '@graphql/resolvers/tournament';

// sorting stuff for the tournament bracket
enum BRACKET_SORT {
  TOURNAMENT_ID,
  BRACKET_PLATFORM_ID,
  PLATFORM_ID_ASC,
  PLATFORM_ID_DESC,
  SLUG_ASC,
  SLUG_DESC,
  ID,
}

// register enum with graphql
registerEnumType(BRACKET_SORT, {
  name: 'BracketSort',
  description: 'Sort tournament brackets by this enum',
});

// turn sort into array usable by lodash
const mapSort = (sort: BRACKET_SORT): MapSort => {
  switch (sort) {
    case BRACKET_SORT.BRACKET_PLATFORM_ID:
      return ['platform', 'asc'];
    case BRACKET_SORT.TOURNAMENT_ID:
      return ['tournament', 'asc'];
    case BRACKET_SORT.PLATFORM_ID_ASC:
      return ['platform_id', 'asc'];
    case BRACKET_SORT.PLATFORM_ID_DESC:
      return ['platform_id', 'desc'];
    case BRACKET_SORT.SLUG_ASC:
      return ['slug', 'asc'];
    case BRACKET_SORT.SLUG_DESC:
      return ['slug', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

// arguments for bracket
@ArgsType()
export class BracketArgs {
  @Field(() => ObjectIdScalar, {
    description: BRACKET_DESCRIPTIONS.ID,
    nullable: true,
  })
  id?: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: BRACKET_DESCRIPTIONS.TOURNAMENT_ID,
    nullable: true,
  })
  tournament?: ObjectId;
}

// arguments for brackets
@ArgsType()
export class BracketsArgs {
  @Field(() => [ObjectIdScalar], {
    description: BRACKET_DESCRIPTIONS.IDS,
    nullable: true,
  })
  ids?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    description: TOURNAMENT_DESCRIPTIONS.IDS,
    nullable: true,
  })
  tournaments?: Array<ObjectId>;

  @Field(() => ObjectIdScalar, {
    description: BRACKET_PLATFORM_DESCRIPTIONS.ID,
    nullable: true,
  })
  bracket_platform?: ObjectId;

  @Field({
    description: BRACKET_DESCRIPTIONS.PLATFORM_ID,
    nullable: true,
  })
  platform_id?: string;

  @Field({
    description: BRACKET_DESCRIPTIONS.SLUG,
    nullable: true,
  })
  slug?: string;

  @Field(() => BRACKET_SORT, {
    nullable: true,
    defaultValue: BRACKET_SORT.ID,
  })
  sort!: BRACKET_SORT;
}

// methods for getting data
export class BracketResolverMethods {
  static async bracket({
    args: { id, tournament },
    ctx,
  }: CtxWithArgs<BracketArgs>): Promise<Bracket | null> {
    if (!id && !tournament) {
      return null;
    }

    if (id && !tournament) {
      return ctx.loaders.BracketLoader.load(id);
    }

    const q = generateMongooseQueryObject();

    if (id) {
      q._id = id;
    }

    // tournament will exist at this point
    q.tournament = tournament;

    // found a result, so return the first one
    // nothing found, return null
    const [result = null] = await ctx.loaders.BracketsLoader.load(q);
    return result;
  }

  static async brackets({
    ctx,
    args: {
      sort = BRACKET_SORT.ID,
      bracket_platform,
      ids,
      platform_id,
      slug,
      tournaments,
    },
  }: CtxWithArgs<BracketsArgs>): Promise<Array<Bracket>> {
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

    if (bracket_platform) {
      q.platform = bracket_platform;
    }

    if (platform_id) {
      q.platform_id = {
        $regex: `${platform_id}`,
        $options: 'i',
      } as MongooseQuery;
    }

    if (slug) {
      q.slug = {
        $regex: `${slug}`,
        $options: 'i',
      } as MongooseQuery;
    }

    const brackets = await ctx.loaders.BracketsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(brackets, iteratee, orders);
  }
}

// resolver
@Resolver(() => Bracket)
export class BracketResolver {
  // get single tournament bracket
  @Query(() => Bracket, {
    nullable: true,
    description: BRACKET_DESCRIPTIONS.FIND_ONE,
  })
  bracket(
    @Args() { id, tournament }: BracketArgs,
    @Ctx() ctx: Context,
  ): Promise<Bracket | null> {
    return BracketResolverMethods.bracket({ args: { id, tournament }, ctx });
  }

  // get multiple tournament brackets
  @Query(() => [Bracket], {
    description: BRACKET_DESCRIPTIONS.FIND,
  })
  brackets(
    @Args()
    {
      sort,
      bracket_platform,
      ids,
      platform_id,
      slug,
      tournaments,
    }: BracketsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Bracket>> {
    return BracketResolverMethods.brackets({
      ctx,
      args: {
        sort,
        bracket_platform,
        ids,
        platform_id,
        slug,
        tournaments,
      },
    });
  }

  // field resolver to return bracket platform id
  @FieldResolver(() => ObjectIdScalar, {
    description: BRACKET_DESCRIPTIONS.BRACKET_PLATFORM_ID,
  })
  bracket_platform_id(@Root() bracket: DocumentType<Bracket>): ObjectId {
    return bracket.platform as ObjectId;
  }

  // field resolver to return bracket platform
  @FieldResolver(() => BracketPlatform, {
    description: BRACKET_DESCRIPTIONS.BRACKET_PLATFORM,
  })
  bracket_platform(
    @Root() bracket: DocumentType<Bracket>,
    @Ctx() ctx: Context,
  ): Promise<BracketPlatform | null> {
    return BracketPlatformResolverMethods.bracket_platform({
      ctx,
      args: { id: bracket.platform as ObjectId },
    });
  }

  // field resolver to return tournament id
  @FieldResolver(() => ObjectIdScalar, {
    description: BRACKET_DESCRIPTIONS.TOURNAMENT_ID,
  })
  tournament_id(@Root() bracket: DocumentType<Bracket>): ObjectId {
    return bracket.tournament as ObjectId;
  }

  // field resolver to return tournament
  @FieldResolver(() => ObjectIdScalar, {
    description: BRACKET_DESCRIPTIONS.TOURNAMENT,
  })
  tournament(
    @Root() bracket: DocumentType<Bracket>,
    @Ctx() ctx: Context,
  ): Promise<Tournament | null> {
    return TournamentResolverMethods.tournament({
      ctx,
      args: { id: bracket.tournament as ObjectId },
    });
  }
}
