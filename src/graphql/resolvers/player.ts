import {
  Resolver,
  Query,
  Ctx,
  registerEnumType,
  FieldResolver,
  Root,
  Args,
  ArgsType,
  Field,
} from 'type-graphql';
import { Player, PLAYER_DESCRIPTIONS } from '@models/player';
import { Context, CtxWithArgs } from '@lib/graphql';
import {
  generateMongooseQueryObject,
  MapSort,
  MongooseQuery,
} from '@graphql/resolvers';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { orderBy } from 'lodash';
import { GameElo } from '@models/game_elo';
import { GAME_DESCRIPTIONS } from '@models/game';
import {
  GameEloResolverMethods,
  GameElosArgs,
} from '@graphql/resolvers/game_elo';
import { DocumentType } from '@typegoose/typegoose';
import {
  PlayerSocial,
  PLAYER_SOCIAL_DESCRIPTIONS,
} from '@models/player_social';
import { PlayerSocialResolverMethods } from '@graphql/resolvers/player_social';
import { Tournament } from '@models/tournament';
import {
  TournamentResolverMethods,
  TournamentsArgs,
} from '@graphql/resolvers/tournament';
import { MatchesArgs, MatchResolverMethods } from '@graphql/resolvers/match';
import { Match, MATCH_DESCRIPTIONS } from '@models/match';
import { Result, RESULT_DESCRIPTIONS } from '@models/result';
import { ResultsArgs, ResultResolverMethods } from '@graphql/resolvers/result';
import {
  TournamentSeriesElosArgs,
  TournamentSeriesEloResolverMethods,
} from '@graphql/resolvers/tournament_series_elo';
import {
  TournamentSeriesElo,
  TOURNAMENT_SERIES_ELO_DESCRIPTIONS,
} from '@models/tournament_series_elo';

export enum PLAYER_SORT {
  HANDLE_ASC,
  HANDLE_DESC,
  IS_STAFF,
  ID,
}

registerEnumType(PLAYER_SORT, {
  name: 'PlayerSort',
  description: 'Sort players by this enum',
});

const mapSort = (sort: PLAYER_SORT): MapSort => {
  switch (sort) {
    case PLAYER_SORT.HANDLE_ASC:
      return ['handle', 'asc'];
    case PLAYER_SORT.HANDLE_DESC:
      return ['handle', 'desc'];
    case PLAYER_SORT.IS_STAFF:
      return ['is_staff', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

@ArgsType()
export class PlayerArgs {
  @Field(() => ObjectIdScalar, {
    description: PLAYER_DESCRIPTIONS.ID,
  })
  id!: ObjectId;
}

@ArgsType()
export class PlayersArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: PLAYER_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field({
    nullable: true,
  })
  search?: string;

  @Field(() => PLAYER_SORT, {
    nullable: true,
    defaultValue: PLAYER_SORT.HANDLE_ASC,
  })
  sort!: PLAYER_SORT;
}

export class PlayerResolverMethods {
  static player({
    args: { id },
    ctx,
  }: CtxWithArgs<PlayerArgs>): Promise<Player | null> {
    return ctx.loaders.PlayerLoader.load(id);
  }

  static async players({
    ctx,
    args: { ids, search, sort = PLAYER_SORT.HANDLE_ASC },
  }: CtxWithArgs<PlayersArgs>): Promise<Array<Player>> {
    const q = generateMongooseQueryObject();

    if (search) {
      q.handle = {
        $regex: `${search}`,
        $options: 'i',
      } as MongooseQuery;
    }

    if (ids) {
      q._id = {
        $in: ids,
      } as MongooseQuery;
    }

    const players = await ctx.loaders.PlayersLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(players, iteratee, orders);
  }
}

@Resolver(() => Player)
export class PlayerResolver {
  // get a single player
  @Query(() => Player, {
    nullable: true,
    description: PLAYER_DESCRIPTIONS.FIND_ONE,
  })
  player(
    @Args() { id }: PlayerArgs,
    @Ctx() ctx: Context,
  ): Promise<Player | null> {
    return PlayerResolverMethods.player({ args: { id }, ctx });
  }

  // get multiple players
  @Query(() => [Player], {
    description: PLAYER_DESCRIPTIONS.FIND,
  })
  players(
    @Args() { sort, ids, search }: PlayersArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Player>> {
    return PlayerResolverMethods.players({
      ctx,
      args: { ids, search, sort },
    });
  }

  // Add tournaments this player has featured in
  @FieldResolver(() => [Tournament])
  tournaments(
    @Root() player: DocumentType<Player>,
    @Args(() => TournamentsArgs)
    {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      games,
      ids,
      event,
      search,
      type,
    }: TournamentsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Tournament>> {
    return TournamentResolverMethods.tournaments({
      args: {
        players: [player._id],
        date_end_gte,
        date_end_lte,
        date_start_gte,
        date_start_lte,
        event,
        games,
        ids,
        search,
        type,
        sort,
      },
      ctx,
    });
  }

  // Player social media information
  @FieldResolver(() => PlayerSocial, {
    description: PLAYER_SOCIAL_DESCRIPTIONS.DESCRIPTION,
    nullable: true,
  })
  player_social(
    @Root() player: DocumentType<Player>,
    @Ctx() ctx: Context,
  ): Promise<PlayerSocial | null> {
    return PlayerSocialResolverMethods.player_social({
      args: { player: player._id },
      ctx,
    });
  }

  // TODO: Add player platform (when auth is done (for admins/update purposes))

  // game elo, also search and sort
  @FieldResolver(() => [GameElo], {
    description: GAME_DESCRIPTIONS.GAME_ELO,
    nullable: true,
  })
  game_elos(
    @Root() player: DocumentType<Player>,
    @Args(() => GameElosArgs) { sort, games }: GameElosArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<GameElo>> {
    return GameEloResolverMethods.game_elos({
      args: { games, players: [player._id], sort },
      ctx,
    });
  }

  @FieldResolver(() => [Match], {
    description: MATCH_DESCRIPTIONS.DESCRIPTION,
    nullable: true,
  })
  matches(
    @Root() player: DocumentType<Player>,
    @Args(() => MatchesArgs)
    {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      ids,
      losers,
      winners,
      round,
      round_name,
      tournaments,
      players = [],
    }: MatchesArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Match>> {
    return MatchResolverMethods.matches({
      ctx,
      args: {
        sort,
        date_end_gte,
        date_end_lte,
        date_start_gte,
        date_start_lte,
        ids,
        losers,
        players: [player._id, ...players],
        round,
        round_name,
        tournaments,
        winners,
      },
    });
  }

  // populate results
  @FieldResolver(() => [Result], {
    description: RESULT_DESCRIPTIONS.DESCRIPTION,
  })
  results(
    @Root() player: DocumentType<Player>,
    @Args(() => ResultsArgs)
    { sort, ids, players = [], rank_gte, rank_lte, tournaments }: ResultsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Result>> {
    return ResultResolverMethods.results({
      ctx,
      args: {
        sort,
        ids,
        players: [player._id, ...players],
        rank_gte,
        rank_lte,
        tournaments,
      },
    });
  }

  // populate tournament series elos
  @FieldResolver(() => [TournamentSeriesElo], {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.DESCRIPTION,
    nullable: true,
  })
  tournament_series_elos(
    @Root() player: DocumentType<Player>,
    @Args(() => TournamentSeriesElosArgs)
    {
      sort,
      ids,
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
        players: [player._id],
        score_gte,
        score_lte,
        tournament_series,
      },
    });
  }
}
