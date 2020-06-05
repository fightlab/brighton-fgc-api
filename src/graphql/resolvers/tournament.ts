import {
  registerEnumType,
  Resolver,
  Arg,
  Ctx,
  Query,
  FieldResolver,
  Root,
  Args,
  ArgsType,
  Field,
} from 'type-graphql';
import {
  TOURNAMENT_TYPE,
  TOURNAMENT_DESCRIPTIONS,
  Tournament,
} from '@models/tournament';
import { Event } from '@models/event';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { ObjectId } from 'mongodb';
import { Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { DocumentType } from '@typegoose/typegoose';
import { Game } from '@models/game';
import { GameResolverMethods, GamesArgs } from '@graphql/resolvers/game';
import { PlayerResolverMethods, PlayersArgs } from './player';
import { Player } from '@models/player';

export enum TOURNAMENT_SORT {
  NAME_ASC,
  NAME_DESC,
  DATE_START_ASC,
  DATE_START_DESC,
  DATE_END_ASC,
  DATE_END_DESC,
  EVENT_ID,
  ID,
}

registerEnumType(TOURNAMENT_SORT, {
  name: 'TournamentSort',
  description: 'Sort tournaments by this enum',
});

registerEnumType(TOURNAMENT_TYPE, {
  name: 'TournamentType',
  description: TOURNAMENT_DESCRIPTIONS.TYPE,
});

const mapSort = (sort: TOURNAMENT_SORT): MapSort => {
  switch (sort) {
    case TOURNAMENT_SORT.NAME_ASC:
      return ['name', 'asc'];
    case TOURNAMENT_SORT.NAME_DESC:
      return ['name', 'desc'];
    case TOURNAMENT_SORT.DATE_START_ASC:
      return ['date_start', 'asc'];
    case TOURNAMENT_SORT.DATE_START_DESC:
      return ['date_start', 'desc'];
    case TOURNAMENT_SORT.DATE_END_ASC:
      return ['date_end', 'asc'];
    case TOURNAMENT_SORT.DATE_END_DESC:
      return ['date_end', 'desc'];
    case TOURNAMENT_SORT.EVENT_ID:
      return ['event', 'asc'];
    default:
      return ['_id', 'asc'];
  }
};

@ArgsType()
export class TournamentsArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field({
    nullable: true,
  })
  search?: string;

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

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_DESCRIPTIONS.GAMES,
  })
  games?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: TOURNAMENT_DESCRIPTIONS.PLAYERS,
  })
  players?: Array<ObjectId>;

  @Field(() => ObjectIdScalar, {
    nullable: true,
    description: TOURNAMENT_DESCRIPTIONS.EVENT,
  })
  event?: ObjectId;

  @Field(() => TOURNAMENT_TYPE, {
    nullable: true,
  })
  type?: TOURNAMENT_TYPE;

  @Field(() => TOURNAMENT_SORT, {
    nullable: true,
    defaultValue: TOURNAMENT_SORT.DATE_START_DESC,
  })
  sort!: TOURNAMENT_SORT;
}

export class TournamentResolverMethodsClass {
  static tournament({
    id,
    ctx,
  }: {
    id: ObjectId;
    ctx: Context;
  }): Promise<Tournament> {
    return ctx.loaders.TournamentLoader.load(id);
  }

  static async tournaments({
    ids,
    search,
    date_start_gte,
    date_start_lte,
    date_end_gte,
    date_end_lte,
    event,
    games,
    players,
    type,
    sort = TOURNAMENT_SORT.DATE_START_DESC,
    ctx,
  }: {
    ids?: Array<ObjectId>;
    search?: string;
    date_start_gte?: Date;
    date_start_lte?: Date;
    date_end_gte?: Date;
    date_end_lte?: Date;
    event?: ObjectId;
    games?: Array<ObjectId>;
    players?: Array<ObjectId>;
    type?: TOURNAMENT_TYPE;
    sort?: TOURNAMENT_SORT;
    ctx: Context;
  }): Promise<Array<Tournament>> {
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

    if (event) {
      q.event = event;
    }

    if (games) {
      q.games = {
        $in: games,
      } as MongooseQuery;
    }

    if (players) {
      q.players = {
        $in: players,
      } as MongooseQuery;
    }

    if (type) {
      q.type = type;
    }

    const tournaments = await ctx.loaders.TournamentsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(tournaments, iteratee, orders);
  }
}

@Resolver(() => Tournament)
export class TournamentResolver {
  @Query(() => Tournament, {
    nullable: true,
    description: TOURNAMENT_DESCRIPTIONS.FIND_ONE,
  })
  tournament(
    @Arg('id', () => ObjectIdScalar, {
      description: TOURNAMENT_DESCRIPTIONS.ID,
    })
    id: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return TournamentResolverMethodsClass.tournament({ id, ctx });
  }

  @Query(() => [Tournament], {
    description: TOURNAMENT_DESCRIPTIONS.FIND,
  })
  tournaments(
    @Args()
    {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      event,
      games,
      ids,
      players,
      search,
      type,
    }: TournamentsArgs,
    @Ctx() ctx: Context,
  ) {
    return TournamentResolverMethodsClass.tournaments({
      ctx,
      ids,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      event,
      games,
      players,
      type,
      search,
      sort,
    });
  }

  // event ids
  @FieldResolver(() => ObjectIdScalar)
  event_id(@Root() tournament: DocumentType<Tournament>) {
    return tournament.event;
  }

  // populate event field
  @FieldResolver(() => Event)
  event(@Root() tournament: DocumentType<Tournament>, @Ctx() ctx: Context) {
    return ctx.loaders.EventLoader.load(tournament.event);
  }

  // game ids
  @FieldResolver(() => [ObjectIdScalar])
  game_ids(@Root() tournament: DocumentType<Tournament>) {
    return tournament.games;
  }

  // populate games array field
  @FieldResolver(() => [Game])
  games(
    @Root() tournament: DocumentType<Tournament>,
    @Args(() => GamesArgs) { sort, search }: GamesArgs,
    @Ctx() ctx: Context,
  ) {
    return GameResolverMethods.games({
      ids: tournament.games as Array<ObjectId>,
      search,
      sort,
      ctx,
    });
  }

  // players ids
  @FieldResolver(() => [ObjectIdScalar])
  player_ids(@Root() tournament: DocumentType<Tournament>) {
    return tournament.players;
  }

  // populate players array
  @FieldResolver(() => [Player])
  players(
    @Root() tournament: DocumentType<Tournament>,
    @Args(() => PlayersArgs) { sort, search }: PlayersArgs,
    @Ctx() ctx: Context,
  ) {
    return PlayerResolverMethods.players({
      ids: tournament.players as Array<ObjectId>,
      search,
      sort,
      ctx,
    });
  }
}