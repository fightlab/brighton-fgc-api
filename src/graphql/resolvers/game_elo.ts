import {
  Resolver,
  Query,
  Ctx,
  Arg,
  registerEnumType,
  FieldResolver,
  Root,
} from 'type-graphql';
import { ObjectId } from 'mongodb';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { GameElo, GAME_ELO_DESCRIPTIONS } from '@models/game_elo';
import { Context } from '@lib/graphql';
import {
  generateMongooseQueryObject,
  MapSort,
  MongooseQuery,
} from '@graphql/resolvers';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';

export enum GAME_ELO_SORT {
  GAME_ID,
  PLAYER_ID,
  SCORE_ASC,
  SCORE_DESC,
  ID,
}

registerEnumType(GAME_ELO_SORT, {
  name: 'GameEloSort',
  description: 'Sort game elo ratings by this enum',
});

export const mapSort = (sort: GAME_ELO_SORT): MapSort => {
  switch (sort) {
    case GAME_ELO_SORT.GAME_ID:
      return ['game', 'asc'];
    case GAME_ELO_SORT.PLAYER_ID:
      return ['player', 'asc'];
    case GAME_ELO_SORT.SCORE_ASC:
      return ['score', 'asc'];
    case GAME_ELO_SORT.SCORE_DESC:
      return ['score', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

@Resolver(() => GameElo)
export class GameEloResolver {
  // get a single game elo by game and player
  @Query(() => GameElo, {
    nullable: true,
    description: GAME_ELO_DESCRIPTIONS.FIND_ONE,
  })
  async game_elo(
    @Arg('game', () => ObjectIdScalar, {
      description: GAME_ELO_DESCRIPTIONS.GAME,
    })
    game: ObjectId,
    @Arg('player', () => ObjectIdScalar, {
      description: GAME_ELO_DESCRIPTIONS.PLAYER,
    })
    player: ObjectId,
    @Ctx() ctx: Context,
  ) {
    const q = generateMongooseQueryObject();
    q.game = game;
    q.player = player;

    const results = await ctx.loaders.GameElosLoader.load(q);
    // found a result, so return the first one
    if (results.length) {
      return results[0];
    }
    // nothing found, return null
    return null;
  }

  // get multiple game elos based on a list of games or players
  @Query(() => [GameElo], {
    description: GAME_ELO_DESCRIPTIONS.FIND,
  })
  async game_elos(
    @Arg('games', () => [ObjectIdScalar], {
      nullable: true,
      description: GAME_ELO_DESCRIPTIONS.GAME_IDS,
    })
    games: Array<ObjectId>,
    @Arg('players', () => [ObjectIdScalar], {
      nullable: true,
      description: GAME_ELO_DESCRIPTIONS.GAME_IDS,
    })
    players: Array<ObjectId>,
    @Arg('sort', () => GAME_ELO_SORT, {
      nullable: true,
      defaultValue: GAME_ELO_SORT.SCORE_DESC,
    })
    sort: GAME_ELO_SORT,
    @Ctx() ctx: Context,
  ) {
    const q = generateMongooseQueryObject();

    if (games) {
      q.game = {
        $in: games,
      } as MongooseQuery;
    }

    if (players) {
      q.player = {
        $in: players,
      } as MongooseQuery;
    }

    const elos = await ctx.loaders.GameElosLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(elos, iteratee, orders);
  }

  // populate player
  @FieldResolver(() => ObjectIdScalar, {
    description: GAME_ELO_DESCRIPTIONS.PLAYER,
  })
  player_id(@Root() game_elo: DocumentType<GameElo>) {
    return game_elo.player;
  }

  @FieldResolver()
  player(@Root() game_elo: DocumentType<GameElo>, @Ctx() ctx: Context) {
    return ctx.loaders.PlayerLoader.load(game_elo.player);
  }

  // populate game
  @FieldResolver(() => ObjectIdScalar, {
    description: GAME_ELO_DESCRIPTIONS.GAME,
  })
  game_id(@Root() game_elo: DocumentType<GameElo>) {
    return game_elo.game;
  }

  @FieldResolver()
  game(@Root() game_elo: DocumentType<GameElo>, @Ctx() ctx: Context) {
    return ctx.loaders.GameLoader.load(game_elo.game);
  }
}
