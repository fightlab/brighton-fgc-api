import {
  registerEnumType,
  ArgsType,
  Field,
  Resolver,
  Query,
  Args,
  Ctx,
  Root,
  FieldResolver,
} from 'type-graphql';
import { MapSort, generateMongooseQueryObject, MongooseQuery } from '.';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { MATCH_ELO_DESCRIPTIONS, MatchElo } from '@models/match_elo';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { Match } from '@models/match';
import { MatchResolverMethods } from './match';
import { Player } from '@models/player';
import { PlayerResolverMethods } from './player';

// sort enum
export enum MATCH_ELO_SORT {
  MATCH_ID,
  PLAYER_ID,
  BEFORE_SCORE_ASC,
  BEFORE_SCORE_DESC,
  AFTER_SCORE_ASC,
  AFTER_SCORE_DESC,
  ID,
}

// register enum
registerEnumType(MATCH_ELO_SORT, {
  name: 'MatchEloSort',
  description: 'Sort match elo ratings by this enum',
});

// map sort
export const mapSort = (sort: MATCH_ELO_SORT): MapSort => {
  switch (sort) {
    case MATCH_ELO_SORT.MATCH_ID:
      return ['match', 'asc'];
    case MATCH_ELO_SORT.PLAYER_ID:
      return ['player', 'asc'];
    case MATCH_ELO_SORT.BEFORE_SCORE_ASC:
      return ['before', 'asc'];
    case MATCH_ELO_SORT.BEFORE_SCORE_DESC:
      return ['before', 'desc'];
    case MATCH_ELO_SORT.AFTER_SCORE_ASC:
      return ['after', 'asc'];
    case MATCH_ELO_SORT.AFTER_SCORE_DESC:
      return ['after', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

// match elo args
@ArgsType()
export class MatchEloArgs {
  @Field(() => ObjectIdScalar, {
    description: MATCH_ELO_DESCRIPTIONS.MATCH_ID,
  })
  match!: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: MATCH_ELO_DESCRIPTIONS.PLAYER_ID,
  })
  player!: ObjectId;
}

// match elos args
@ArgsType()
export class MatchElosArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_ELO_DESCRIPTIONS.MATCH_IDS,
  })
  matches?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_ELO_DESCRIPTIONS.PLAYER_IDS,
  })
  players?: Array<ObjectId>;

  @Field(() => MATCH_ELO_SORT, {
    nullable: true,
    defaultValue: MATCH_ELO_SORT.ID,
  })
  sort!: MATCH_ELO_SORT;
}

// match elo resolver methods
export class MatchEloResolverMethods {
  static async match_elo({
    args: { match, player },
    ctx,
  }: CtxWithArgs<MatchEloArgs>): Promise<MatchElo | null> {
    const q = generateMongooseQueryObject();
    q.match = match;
    q.player = player;

    // find a result, so return the first one
    // nothing found, return null
    const [results = null] = await ctx.loaders.MatchElosLoader.load(q);
    return results;
  }

  static async match_elos({
    ctx,
    args: { sort, matches, players },
  }: CtxWithArgs<MatchElosArgs>): Promise<Array<MatchElo>> {
    const q = generateMongooseQueryObject();

    if (matches) {
      q.match = {
        $in: matches,
      } as MongooseQuery;
    }

    if (players) {
      q.player = {
        $in: players,
      } as MongooseQuery;
    }

    const elos = await ctx.loaders.MatchElosLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(elos, iteratee, orders);
  }
}

// match elo resolver
@Resolver(() => MatchElo)
export class MatchEloResolver {
  // get single match elo
  @Query(() => MatchElo, {
    nullable: true,
    description: MATCH_ELO_DESCRIPTIONS.FIND_ONE,
  })
  match_elo(
    @Args() { match, player }: MatchEloArgs,
    @Ctx() ctx: Context,
  ): Promise<MatchElo | null> {
    return MatchEloResolverMethods.match_elo({
      args: { match, player },
      ctx,
    });
  }

  // get multiple match elos
  @Query(() => [MatchElo], {
    nullable: true,
    description: MATCH_ELO_DESCRIPTIONS.FIND,
  })
  match_elos(
    @Args() { sort, matches, players }: MatchElosArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<MatchElo>> {
    return MatchEloResolverMethods.match_elos({
      args: { sort, matches, players },
      ctx,
    });
  }

  // match id
  @FieldResolver(() => ObjectIdScalar, {
    description: MATCH_ELO_DESCRIPTIONS.MATCH_ID,
  })
  match_id(@Root() match_elo: DocumentType<MatchElo>): ObjectId {
    return match_elo.match as ObjectId;
  }

  // populate match
  @FieldResolver(() => Match, {
    description: MATCH_ELO_DESCRIPTIONS.MATCH,
  })
  match(
    @Root() match_elo: DocumentType<MatchElo>,
    @Ctx() ctx: Context,
  ): Promise<Match | null> {
    return MatchResolverMethods.match({
      ctx,
      args: { id: match_elo.match as ObjectId },
    });
  }

  // player id
  @FieldResolver(() => ObjectIdScalar, {
    description: MATCH_ELO_DESCRIPTIONS.PLAYER_ID,
  })
  player_id(@Root() match_elo: DocumentType<MatchElo>): ObjectId {
    return match_elo.player as ObjectId;
  }

  // populate player
  @FieldResolver(() => Player, {
    description: MATCH_ELO_DESCRIPTIONS.PLAYER,
  })
  player(
    @Root() match_elo: DocumentType<MatchElo>,
    @Ctx() ctx: Context,
  ): Promise<Player | null> {
    return PlayerResolverMethods.player({
      ctx,
      args: { id: match_elo.player as ObjectId },
    });
  }
}
