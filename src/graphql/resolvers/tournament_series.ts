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
  TOURNAMENT_SERIES_DESCRIPTIONS,
  TournamentSeries,
} from '@models/tournament_series';
import { ObjectId } from 'mongodb';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { Tournament } from '@models/tournament';
import {
  TournamentsArgs,
  TournamentResolverMethods,
} from '@graphql/resolvers/tournament';
import { Game } from '@models/game';
import { GameResolverMethods } from '@graphql/resolvers/game';

// sort
export enum TOURNAMENT_SERIES_SORT {
  NAME_ASC,
  NAME_DESC,
  ID,
}

// register sort
registerEnumType(TOURNAMENT_SERIES_SORT, {
  name: 'TournamentSeriesSort',
  description: 'Sort tournament series by this enum',
});

// map sort
export const mapSort = (sort: TOURNAMENT_SERIES_SORT): MapSort => {
  switch (sort) {
    case TOURNAMENT_SERIES_SORT.NAME_ASC:
      return ['name', 'asc'];
    case TOURNAMENT_SERIES_SORT.NAME_DESC:
      return ['name', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

// args single
@ArgsType()
export class TournamentSeriesSingleArgs {
  @Field(() => ObjectIdScalar, {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.ID,
  })
  id!: ObjectId;
}

// args multi

@ArgsType()
export class TournamentSeriesArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_SERIES_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_SERIES_DESCRIPTIONS.TOURNAMENT_IDS,
  })
  tournaments?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_SERIES_DESCRIPTIONS.GAME_IDS,
  })
  games?: Array<ObjectId>;

  @Field({
    nullable: true,
  })
  search?: string;

  @Field(() => TOURNAMENT_SERIES_SORT, {
    nullable: true,
    defaultValue: TOURNAMENT_SERIES_SORT.NAME_ASC,
  })
  sort!: TOURNAMENT_SERIES_SORT;
}

// resolver methods
export class TournamentSeriesResolverMethods {
  static tournament_series_single({
    ctx,
    args: { id },
  }: CtxWithArgs<
    TournamentSeriesSingleArgs
  >): Promise<TournamentSeries | null> {
    return ctx.loaders.TournamentSeriesLoader.load(id);
  }

  static async tournament_series({
    ctx,
    args: {
      tournaments,
      games,
      ids,
      search,
      sort = TOURNAMENT_SERIES_SORT.NAME_ASC,
    },
  }: CtxWithArgs<TournamentSeriesArgs>): Promise<Array<TournamentSeries>> {
    const q = generateMongooseQueryObject();

    if (ids) {
      q._id = {
        $in: ids,
      } as MongooseQuery;
    }

    if (tournaments) {
      q.tournaments = {
        $in: tournaments,
      };
    }

    if (games) {
      q.game = {
        $in: games,
      };
    }

    if (search) {
      q.name = {
        $regex: `${search}`,
        $options: 'i',
      } as MongooseQuery;
    }

    const series = await ctx.loaders.TournamentSeriesMultiLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(series, iteratee, orders);
  }
}

// resolver
@Resolver(() => TournamentSeries)
export class TournamentSeriesResolver {
  @Query(() => TournamentSeries, {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.FIND_ONE,
    nullable: true,
  })
  tournament_series_single(
    @Args() { id }: TournamentSeriesSingleArgs,
    @Ctx() ctx: Context,
  ): Promise<TournamentSeries | null> {
    return TournamentSeriesResolverMethods.tournament_series_single({
      ctx,
      args: { id },
    });
  }

  @Query(() => [TournamentSeries], {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.FIND,
  })
  tournament_series(
    @Args() { sort, tournaments, games, ids, search }: TournamentSeriesArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<TournamentSeries>> {
    return TournamentSeriesResolverMethods.tournament_series({
      args: { ids, search, tournaments, games, sort },
      ctx,
    });
  }

  // tournament ids
  @FieldResolver(() => [ObjectIdScalar], {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.TOURNAMENT_IDS,
  })
  tournament_ids(
    @Root() tournament_series: DocumentType<TournamentSeries>,
  ): Array<ObjectId> {
    return tournament_series.tournaments as Array<ObjectId>;
  }

  // populate tournaments
  @FieldResolver(() => [Tournament], {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.TOURNAMENTS,
  })
  tournaments(
    @Root() tournament_series: DocumentType<TournamentSeries>,
    @Args(() => TournamentsArgs)
    {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      search,
      event,
      games,
      players,
      type,
    }: TournamentsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Tournament>> {
    return TournamentResolverMethods.tournaments({
      args: {
        ids: tournament_series.tournaments as Array<ObjectId>,
        date_end_gte,
        date_end_lte,
        date_start_gte,
        date_start_lte,
        search,
        sort,
        event,
        games,
        players,
        type,
      },
      ctx,
    });
  }

  // populate game
  @FieldResolver(() => ObjectIdScalar, {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.GAME_ID,
    nullable: true,
  })
  game_id(@Root() tournament_series: DocumentType<TournamentSeries>): ObjectId {
    return tournament_series.game as ObjectId;
  }

  @FieldResolver(() => Game, {
    description: TOURNAMENT_SERIES_DESCRIPTIONS.GAME,
    nullable: true,
  })
  game(
    @Root() tournament_series: DocumentType<TournamentSeries>,
    @Ctx() ctx: Context,
  ): Promise<Game | null> {
    return GameResolverMethods.game({
      args: { id: tournament_series.game as ObjectId },
      ctx,
    });
  }
}
