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
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import {
  TOURNAMENT_SERIES_ELO_DESCRIPTIONS,
  TournamentSeriesElo,
} from '@models/tournament_series_elo';
import { ObjectId } from 'mongodb';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { Tournament } from '@models/tournament';
import { DocumentType } from '@typegoose/typegoose';
import { TournamentSeriesResolverMethods } from '@graphql/resolvers/tournament_series';
import { TournamentSeries } from '@models/tournament_series';
import { Player } from '@models/player';
import { PlayerResolverMethods } from '@graphql/resolvers/player';

// sort enum
export enum TOURNAMENT_SERIES_ELO_SORT {
  TOURNAMENT_SERIES_ID,
  PLAYER_ID,
  SCORE_ASC,
  SCORE_DESC,
  ID,
}

// register sort enum
registerEnumType(TOURNAMENT_SERIES_ELO_SORT, {
  name: 'TournamentSeriesEloSort',
  description: 'Sort tournament series elo ratings by this enum',
});

// map sort emun
export const mapSort = (sort: TOURNAMENT_SERIES_ELO_SORT): MapSort => {
  switch (sort) {
    case TOURNAMENT_SERIES_ELO_SORT.TOURNAMENT_SERIES_ID:
      return ['tournament_series', 'asc'];
    case TOURNAMENT_SERIES_ELO_SORT.PLAYER_ID:
      return ['player', 'asc'];
    case TOURNAMENT_SERIES_ELO_SORT.SCORE_ASC:
      return ['score', 'asc'];
    case TOURNAMENT_SERIES_ELO_SORT.SCORE_DESC:
      return ['score', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

// single args
@ArgsType()
export class TournamentSeriesEloArgs {
  @Field(() => ObjectIdScalar, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.ID,
    nullable: true,
  })
  id?: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.TOURNAMENT_SERIES_ID,
    nullable: true,
  })
  tournament_series?: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.PLAYER,
    nullable: true,
  })
  player?: ObjectId;
}

// multiple args
@ArgsType()
export class TournamentSeriesElosArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.TOURNAMENT_SERIES_IDS,
  })
  tournament_series?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.PLAYER_IDS,
  })
  players?: Array<ObjectId>;

  @Field(() => Number, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.SCORE_MIN,
    nullable: true,
  })
  score_gte?: number;

  @Field(() => Number, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.SCORE_MAX,
    nullable: true,
  })
  score_lte?: number;

  @Field(() => TOURNAMENT_SERIES_ELO_SORT, {
    nullable: true,
    defaultValue: TOURNAMENT_SERIES_ELO_SORT.SCORE_DESC,
  })
  sort!: TOURNAMENT_SERIES_ELO_SORT;
}

// resolver methods
export class TournamentSeriesEloResolverMethods {
  static async tournament_series_elo({
    ctx,
    args: { id, player, tournament_series },
  }: CtxWithArgs<
    TournamentSeriesEloArgs
  >): Promise<TournamentSeriesElo | null> {
    if (!id && !tournament_series && !player) {
      return null;
    }

    // if id exists use the single loader by id
    if (id) {
      return ctx.loaders.TournamentSeriesEloLoader.load(id);
    }

    // at this point we need both tournament_series and player, so check both exist
    if (!tournament_series || !player) {
      return null;
    }

    const q = generateMongooseQueryObject();

    q.tournament_series = tournament_series;

    q.player = player;

    // found a tournament_series_elo, so return the first one
    // nothing found, return null
    const [
      tournament_series_elo = null,
    ] = await ctx.loaders.TournamentSeriesElosLoader.load(q);
    return tournament_series_elo;
  }

  static async tournament_series_elos({
    ctx,
    args: { sort, ids, players, tournament_series, score_gte, score_lte },
  }: CtxWithArgs<TournamentSeriesElosArgs>): Promise<
    Array<TournamentSeriesElo>
  > {
    const q = generateMongooseQueryObject();

    if (ids) {
      q._id = {
        $in: ids,
      } as MongooseQuery;
    }

    if (tournament_series) {
      q.tournament_series = {
        $in: tournament_series,
      } as MongooseQuery;
    }

    if (players) {
      q.player = {
        $in: players,
      } as MongooseQuery;
    }

    if (score_lte || score_gte) {
      q.score = {} as MongooseQuery;
      if (score_lte) {
        q.score.$lte = score_lte;
      }
      if (score_gte) {
        q.score.$gte = score_gte;
      }
    }

    const tournament_series_elos = await ctx.loaders.TournamentSeriesElosLoader.load(
      q,
    );
    const [iteratee, orders] = mapSort(sort);
    return orderBy(tournament_series_elos, iteratee, orders);
  }
}

// resolver
@Resolver(() => TournamentSeriesElo)
export class TournamentSeriesEloResolver {
  // get single tournament_series_elo by id, or tournament_series and player
  @Query(() => TournamentSeriesElo, {
    nullable: true,
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.FIND_ONE,
  })
  tournament_series_elo(
    @Args() { id, player, tournament_series }: TournamentSeriesEloArgs,
    @Ctx() ctx: Context,
  ): Promise<TournamentSeriesElo | null> {
    return TournamentSeriesEloResolverMethods.tournament_series_elo({
      ctx,
      args: {
        id,
        player,
        tournament_series,
      },
    });
  }

  // get multiple tournament_series_elos
  @Query(() => [TournamentSeriesElo], {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.FIND,
  })
  tournament_series_elos(
    @Args()
    {
      sort,
      ids,
      players,
      score_gte,
      score_lte,
      tournament_series,
    }: TournamentSeriesElosArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<TournamentSeriesElo>> {
    return TournamentSeriesEloResolverMethods.tournament_series_elos({
      ctx,
      args: {
        sort,
        ids,
        players,
        score_gte,
        score_lte,
        tournament_series,
      },
    });
  }

  // field resolver to return tournament_series id
  @FieldResolver(() => ObjectIdScalar, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.TOURNAMENT_SERIES_ID,
  })
  tournament_series_id(
    @Root() tournament_series_elo: DocumentType<TournamentSeriesElo>,
  ): ObjectId {
    return tournament_series_elo.tournament_series as ObjectId;
  }

  // field resolver to return tournament_series
  @FieldResolver(() => Tournament, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.TOURNAMENT_SERIES,
  })
  tournament_series(
    @Root() tournament_series_elo: DocumentType<TournamentSeriesElo>,
    @Ctx() ctx: Context,
  ): Promise<TournamentSeries | null> {
    return TournamentSeriesResolverMethods.tournament_series_single({
      ctx,
      args: { id: tournament_series_elo.tournament_series as ObjectId },
    });
  }

  // player ids
  @FieldResolver(() => ObjectIdScalar)
  player_id(
    @Root() tournament_series_elo: DocumentType<TournamentSeriesElo>,
  ): ObjectId {
    return tournament_series_elo.player as ObjectId;
  }

  // populate player array
  @FieldResolver(() => Player)
  player(
    @Root() tournament_series_elo: DocumentType<TournamentSeriesElo>,
    @Ctx() ctx: Context,
  ): Promise<Player | null> {
    return PlayerResolverMethods.player({
      args: {
        id: tournament_series_elo.player as ObjectId,
      },
      ctx,
    });
  }
}
