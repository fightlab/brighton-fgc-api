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
  static player({ args: { id }, ctx }: CtxWithArgs<PlayerArgs>) {
    return ctx.loaders.PlayerLoader.load(id);
  }

  static async players({
    ctx,
    args: { ids, search, sort = PLAYER_SORT.HANDLE_ASC },
  }: CtxWithArgs<PlayersArgs>) {
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
  player(@Args() { id }: PlayerArgs, @Ctx() ctx: Context) {
    return PlayerResolverMethods.player({ args: { id }, ctx });
  }

  // get multiple players
  @Query(() => [Player], {
    description: PLAYER_DESCRIPTIONS.FIND,
  })
  players(@Args() { sort, ids, search }: PlayersArgs, @Ctx() ctx: Context) {
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
  ) {
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

  // TODO: Add matches that this player has featured in

  // Player social media information
  @FieldResolver(() => PlayerSocial, {
    description: PLAYER_SOCIAL_DESCRIPTIONS.DESCRIPTION,
    nullable: true,
  })
  player_social(@Root() player: DocumentType<Player>, @Ctx() ctx: Context) {
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
  ) {
    return GameEloResolverMethods.game_elos({
      args: { games, players: [player._id], sort },
      ctx,
    });
  }
}
