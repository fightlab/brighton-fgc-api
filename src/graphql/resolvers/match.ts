import {
  registerEnumType,
  ArgsType,
  Field,
  Query,
  Resolver,
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
import { Match, MATCH_DESCRIPTIONS } from '@models/match';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { Tournament } from '@models/tournament';
import { TournamentResolverMethods } from '@graphql/resolvers/tournament';
import { Player } from '@models/player';
import { PlayersArgs, PlayerResolverMethods } from '@graphql/resolvers/player';
import { MATCH_ELO_DESCRIPTIONS, MatchElo } from '@models/match_elo';
import { MatchEloResolverMethods } from './match_elo';

// sorting stuff for matches
enum MATCH_SORT {
  DATE_START_ASC,
  DATE_START_DESC,
  DATE_END_ASC,
  DATE_END_DESC,
  ROUND_ASC,
  ROUND_DESC,
  TOURNAMENT_ID,
  ID,
}

// register enum with graphql
registerEnumType(MATCH_SORT, {
  name: 'MatchSort',
  description: 'Sort matches by this enum',
});

// turn sort into array useable by lodash orderby
const mapSort = (sort: MATCH_SORT): MapSort => {
  switch (sort) {
    case MATCH_SORT.DATE_START_ASC:
      return ['date_start', 'asc'];
    case MATCH_SORT.DATE_START_DESC:
      return ['date_start', 'desc'];
    case MATCH_SORT.DATE_END_ASC:
      return ['date_end', 'asc'];
    case MATCH_SORT.DATE_END_DESC:
      return ['date_end', 'desc'];
    case MATCH_SORT.ROUND_ASC:
      return [
        (v: Match): number | null => (v.round ? Math.abs(v.round) : null),
        'asc',
      ];
    case MATCH_SORT.ROUND_DESC:
      return [
        (v: Match): number | null => (v.round ? Math.abs(v.round) : null),
        'desc',
      ];
    case MATCH_SORT.TOURNAMENT_ID:
    default:
      return ['_id', 'asc'];
  }
};

// match args
@ArgsType()
export class MatchArgs {
  @Field(() => ObjectIdScalar, {
    description: MATCH_DESCRIPTIONS.ID,
  })
  id!: ObjectId;
}

// matches args
@ArgsType()
export class MatchesArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_DESCRIPTIONS.PLAYER_IDS,
  })
  players?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_DESCRIPTIONS.WINNER_IDS,
  })
  winners?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_DESCRIPTIONS.LOSER_IDS,
  })
  losers?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_DESCRIPTIONS.TOURNAMENT_IDS,
  })
  tournaments?: Array<ObjectId>;

  @Field({
    nullable: true,
  })
  date_start_gte?: Date;

  @Field({
    nullable: true,
  })
  date_start_lte?: Date;

  @Field({
    nullable: true,
  })
  date_end_gte?: Date;

  @Field({
    nullable: true,
  })
  date_end_lte?: Date;

  @Field({
    nullable: true,
  })
  round_name?: string;

  @Field({
    nullable: true,
  })
  round?: number;

  @Field(() => MATCH_SORT, {
    nullable: true,
    defaultValue: MATCH_SORT.DATE_START_ASC,
  })
  sort!: MATCH_SORT;
}

// match resolver methods
export class MatchResolverMethods {
  static match({
    ctx,
    args: { id },
  }: CtxWithArgs<MatchArgs>): Promise<Match | null> {
    return ctx.loaders.MatchLoader.load(id);
  }

  static async matches({
    ctx,
    args: {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      ids,
      losers,
      players,
      round_name,
      tournaments,
      winners,
      round,
    },
  }: CtxWithArgs<MatchesArgs>): Promise<Array<Match>> {
    const q = generateMongooseQueryObject();

    if (round_name) {
      q.round_name = {
        $regex: `${round_name}`,
        $options: 'i',
      } as MongooseQuery;
    }

    if (ids) {
      q._id = {
        $in: ids,
      } as MongooseQuery;
    }

    if (date_start_gte || date_start_lte) {
      q.date_start = {} as MongooseQuery;
      if (date_start_gte) {
        q.date_start.$gte = date_start_gte;
      }
      if (date_start_lte) {
        q.date_start.$lte = date_start_lte;
      }
    }

    if (date_end_gte || date_end_lte) {
      q.date_end = {} as MongooseQuery;
      if (date_end_gte) {
        q.date_end.$gte = date_end_gte;
      }
      if (date_end_lte) {
        q.date_end.$lte = date_end_lte;
      }
    }

    if (players) {
      q.$or = [
        {
          player1: { $in: players } as MongooseQuery,
        },
        {
          player2: { $in: players } as MongooseQuery,
        },
      ] as Array<MongooseQuery>;
    }

    if (winners) {
      q.winner = {
        $in: winners,
      } as MongooseQuery;
    }

    if (losers) {
      q.loser = {
        $in: losers,
      } as MongooseQuery;
    }

    if (tournaments) {
      q.tournament = {
        $in: tournaments,
      } as MongooseQuery;
    }

    if (round) {
      q.round = round;
    }

    const matches = await ctx.loaders.MatchesLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(matches, iteratee, orders);
  }
}

// match resolver
@Resolver(() => Match)
export class MatchResolver {
  @Query(() => Match, {
    nullable: true,
    description: MATCH_DESCRIPTIONS.FIND_ONE,
  })
  match(@Args() { id }: MatchArgs, @Ctx() ctx: Context): Promise<Match | null> {
    return MatchResolverMethods.match({ ctx, args: { id } });
  }

  @Query(() => [Match], {
    nullable: true,
    description: MATCH_DESCRIPTIONS.FIND,
  })
  matches(
    @Args()
    {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      ids,
      losers,
      players,
      round_name,
      tournaments,
      winners,
      round,
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
        players,
        round_name,
        tournaments,
        winners,
        round,
      },
    });
  }

  // field resolver for tournament id
  @FieldResolver(() => ObjectIdScalar, {
    description: MATCH_DESCRIPTIONS.TOURNAMENT_ID,
    nullable: true,
  })
  tournament_id(@Root() match: DocumentType<Match>): ObjectId {
    return match.tournament as ObjectId;
  }

  // field resolver for tournament
  @FieldResolver(() => Tournament, {
    description: MATCH_DESCRIPTIONS.TOURNAMENT,
    nullable: true,
  })
  tournament(
    @Root() match: DocumentType<Match>,
    @Ctx() ctx: Context,
  ): Promise<Tournament | null> {
    return TournamentResolverMethods.tournament({
      ctx,
      args: { id: match.tournament as ObjectId },
    });
  }

  // field resolver for player 1 ids
  @FieldResolver(() => [ObjectIdScalar], {
    description: MATCH_DESCRIPTIONS.PLAYER_1_IDS,
    nullable: true,
  })
  player1_ids(@Root() match: DocumentType<Match>): Array<ObjectId> {
    return match.player1 as Array<ObjectId>;
  }

  // field resolver for player 1
  @FieldResolver(() => [Player], {
    description: MATCH_DESCRIPTIONS.PLAYER_1,
    nullable: true,
  })
  player1(
    @Root() match: DocumentType<Match>,
    @Args(() => PlayersArgs) { sort, search }: PlayersArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Player>> {
    return PlayerResolverMethods.players({
      ctx,
      args: { sort, search, ids: match.player1 as Array<ObjectId> },
    });
  }

  // field resolver for player 2 ids
  @FieldResolver(() => [ObjectIdScalar], {
    description: MATCH_DESCRIPTIONS.PLAYER_2_IDS,
    nullable: true,
  })
  player2_ids(@Root() match: DocumentType<Match>): Array<ObjectId> {
    return match.player2 as Array<ObjectId>;
  }

  // field resolver for player 2
  @FieldResolver(() => [Player], {
    description: MATCH_DESCRIPTIONS.PLAYER_2,
    nullable: true,
  })
  player2(
    @Root() match: DocumentType<Match>,
    @Args(() => PlayersArgs) { sort, search }: PlayersArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Player>> {
    return PlayerResolverMethods.players({
      ctx,
      args: { sort, search, ids: match.player2 as Array<ObjectId> },
    });
  }

  // field resolver for winner ids
  @FieldResolver(() => [ObjectIdScalar], {
    description: MATCH_DESCRIPTIONS.WINNER_IDS,
    nullable: true,
  })
  winner_ids(@Root() match: DocumentType<Match>): Array<ObjectId> {
    return match.winner as Array<ObjectId>;
  }

  // field resolver for winner
  @FieldResolver(() => [Player], {
    description: MATCH_DESCRIPTIONS.WINNER,
    nullable: true,
  })
  winner(
    @Root() match: DocumentType<Match>,
    @Args(() => PlayersArgs) { sort, search }: PlayersArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Player>> {
    return PlayerResolverMethods.players({
      ctx,
      args: { sort, search, ids: match.winner as Array<ObjectId> },
    });
  }

  // field resolver for loser ids
  @FieldResolver(() => [ObjectIdScalar], {
    description: MATCH_DESCRIPTIONS.LOSER_IDS,
    nullable: true,
  })
  loser_ids(@Root() match: DocumentType<Match>): Array<ObjectId> {
    return match.loser as Array<ObjectId>;
  }

  // field resolver for loser
  @FieldResolver(() => [Player], {
    description: MATCH_DESCRIPTIONS.LOSER,
    nullable: true,
  })
  loser(
    @Root() match: DocumentType<Match>,
    @Args(() => PlayersArgs) { sort, search }: PlayersArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Player>> {
    return PlayerResolverMethods.players({
      ctx,
      args: { sort, search, ids: match.loser as Array<ObjectId> },
    });
  }

  @FieldResolver(() => MatchElo, {
    nullable: true,
    description: MATCH_ELO_DESCRIPTIONS.DESCRIPTION,
  })
  match_elo_player1(
    @Root() match: DocumentType<Match>,
    @Ctx() ctx: Context,
  ): Promise<MatchElo | null> {
    return MatchEloResolverMethods.match_elo({
      ctx,
      args: {
        match: match._id as ObjectId,
        player: (match.player1?.[0] as unknown) as ObjectId,
      },
    });
  }

  @FieldResolver(() => MatchElo, {
    nullable: true,
    description: MATCH_ELO_DESCRIPTIONS.DESCRIPTION,
  })
  match_elo_player2(
    @Root() match: DocumentType<Match>,
    @Ctx() ctx: Context,
  ): Promise<MatchElo | null> {
    return MatchEloResolverMethods.match_elo({
      ctx,
      args: {
        match: match._id as ObjectId,
        player: (match.player2?.[0] as unknown) as ObjectId,
      },
    });
  }
}
