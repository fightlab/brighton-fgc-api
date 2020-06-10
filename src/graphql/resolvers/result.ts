import {
  registerEnumType,
  Field,
  ArgsType,
  Args,
  Ctx,
  Resolver,
  Query,
  FieldResolver,
  Root,
} from 'type-graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { RESULT_DESCRIPTIONS, Result } from '@models/result';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { Tournament } from '@models/tournament';
import { TournamentResolverMethods } from '@graphql/resolvers/tournament';
import { Player } from '@models/player';
import { PlayersArgs, PlayerResolverMethods } from '@graphql/resolvers/player';

// sort enum
export enum RESULT_SORT {
  TOURNAMENT_ID,
  PLAYER_ID,
  RANK_ASC,
  RANK_DESC,
  ID,
}

// register enum with graphql
registerEnumType(RESULT_SORT, {
  name: 'ResultSort',
  description: 'Sort results by this enum',
});

// turn sort into form usable by lodash
const mapSort = (sort: RESULT_SORT): MapSort => {
  switch (sort) {
    case RESULT_SORT.TOURNAMENT_ID:
      return ['tournament', 'asc'];
    case RESULT_SORT.PLAYER_ID:
      return ['player', 'asc'];
    case RESULT_SORT.RANK_ASC:
      return ['rank', 'asc'];
    case RESULT_SORT.RANK_DESC:
      return ['rank', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

// result args
@ArgsType()
export class ResultArgs {
  @Field(() => ObjectIdScalar, {
    description: RESULT_DESCRIPTIONS.ID,
    nullable: true,
  })
  id?: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: RESULT_DESCRIPTIONS.TOURNAMENT_ID,
    nullable: true,
  })
  tournament?: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: RESULT_DESCRIPTIONS.PLAYER_ID,
    nullable: true,
  })
  player?: ObjectId;
}

// results args
@ArgsType()
export class ResultsArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: RESULT_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    description: RESULT_DESCRIPTIONS.TOURNAMENT_IDS,
    nullable: true,
  })
  tournaments?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    description: RESULT_DESCRIPTIONS.PLAYER_IDS,
    nullable: true,
  })
  players?: Array<ObjectId>;

  @Field(() => Number, {
    description: RESULT_DESCRIPTIONS.RANK_MIN,
    nullable: true,
  })
  rank_gte?: number;

  @Field(() => Number, {
    description: RESULT_DESCRIPTIONS.RANK_MAX,
    nullable: true,
  })
  rank_lte?: number;

  @Field(() => RESULT_SORT, {
    nullable: true,
    defaultValue: RESULT_SORT.RANK_ASC,
  })
  sort!: RESULT_SORT;
}

// resolver shared methods
export class ResultResolverMethods {
  static async result({
    ctx,
    args: { id, player, tournament },
  }: CtxWithArgs<ResultArgs>): Promise<Result | null> {
    if (!id && !tournament && !player) {
      return null;
    }

    // if id exists use the single loader by id
    if (id) {
      return ctx.loaders.ResultLoader.load(id);
    }

    // at this point we need both tournament and player, so check both exist
    if (!tournament || !player) {
      return null;
    }

    const q = generateMongooseQueryObject();

    q.tournament = tournament;

    q.players = player;

    // found a result, so return the first one
    // nothing found, return null
    const [result = null] = await ctx.loaders.ResultsLoader.load(q);
    return result;
  }

  static async results({
    ctx,
    args: { sort, ids, players, tournaments, rank_lte, rank_gte },
  }: CtxWithArgs<ResultsArgs>): Promise<Array<Result>> {
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

    if (players) {
      q.players = {
        $in: players,
      } as MongooseQuery;
    }

    if (rank_lte || rank_gte) {
      q.rank = {} as MongooseQuery;
      if (rank_lte) {
        q.rank.$lte = rank_lte;
      }
      if (rank_gte) {
        q.rank.$gte = rank_gte;
      }
    }

    const results = await ctx.loaders.ResultsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(results, iteratee, orders);
  }
}

// resolver
@Resolver(() => Result)
export class ResultResolver {
  // get single result by id, or tournament and player
  @Query(() => Result, {
    nullable: true,
    description: RESULT_DESCRIPTIONS.FIND_ONE,
  })
  result(
    @Args() { id, player, tournament }: ResultArgs,
    @Ctx() ctx: Context,
  ): Promise<Result | null> {
    return ResultResolverMethods.result({
      ctx,
      args: {
        id,
        player,
        tournament,
      },
    });
  }

  // get multiple results
  @Query(() => [Result], {
    description: RESULT_DESCRIPTIONS.FIND,
  })
  results(
    @Args()
    { sort, ids, players, tournaments, rank_lte, rank_gte }: ResultsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Result>> {
    return ResultResolverMethods.results({
      ctx,
      args: {
        sort,
        ids,
        players,
        tournaments,
        rank_lte,
        rank_gte,
      },
    });
  }

  // field resolver to return tournament id
  @FieldResolver(() => ObjectIdScalar, {
    description: RESULT_DESCRIPTIONS.TOURNAMENT_ID,
  })
  tournament_id(@Root() result: DocumentType<Result>): ObjectId {
    return result.tournament as ObjectId;
  }

  // field resolver to return tournament
  @FieldResolver(() => Tournament, {
    description: RESULT_DESCRIPTIONS.TOURNAMENT,
  })
  tournament(
    @Root() result: DocumentType<Result>,
    @Ctx() ctx: Context,
  ): Promise<Tournament | null> {
    return TournamentResolverMethods.tournament({
      ctx,
      args: { id: result.tournament as ObjectId },
    });
  }

  // players ids
  @FieldResolver(() => [ObjectIdScalar])
  player_ids(@Root() result: DocumentType<Result>): Array<ObjectId> {
    return result.players as Array<ObjectId>;
  }

  // populate players array
  @FieldResolver(() => [Player])
  players(
    @Root() result: DocumentType<Result>,
    @Args(() => PlayersArgs) { sort, search }: PlayersArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Player>> {
    return PlayerResolverMethods.players({
      args: { ids: result.players as Array<ObjectId>, search, sort },
      ctx,
    });
  }
}
