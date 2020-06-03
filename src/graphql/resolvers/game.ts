// GraphQL Resolver for Games

import {
  Resolver,
  Query,
  Arg,
  Ctx,
  registerEnumType,
  FieldResolver,
  Root,
} from 'type-graphql';
import { DocumentType } from '@typegoose/typegoose';
import { Game, GAME_DESCRIPTIONS } from '@models/game';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import {
  generateMongooseQueryObject,
  MapSort,
  MongooseQuery,
} from '@graphql/resolvers';
import { Character } from '@models/character';
import { GameElo, GAME_ELO_DESCRIPTIONS } from '@models/game_elo';
import {
  GAME_ELO_SORT,
  GameEloResolverMethods,
} from '@graphql/resolvers/game_elo';
import {
  CHARACTER_SORT,
  CharacterMethodResolver,
} from '@graphql/resolvers/character';

// sorting stuff for game
export enum GAME_SORT {
  NAME_ASC,
  NAME_DESC,
  ID,
}

// register the enum with graphql
registerEnumType(GAME_SORT, {
  name: 'GameSort',
  description: 'Sort games by this enum',
});

// turn sort into an array usable by lodash
const mapSort = (sort: GAME_SORT): MapSort => {
  switch (sort) {
    case GAME_SORT.NAME_ASC:
      return ['name', 'asc'];
    case GAME_SORT.NAME_DESC:
      return ['name', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

export class GameResolverMethods {
  static async games({
    search,
    ids,
    sort = GAME_SORT.NAME_ASC,
    ctx,
  }: {
    search?: string;
    ids?: Array<ObjectId>;
    sort?: GAME_SORT;
    ctx: Context;
  }) {
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

    const games = await ctx.loaders.GamesLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(games, iteratee, orders);
  }
}

@Resolver(() => Game)
export class GameResolver {
  // get a single game
  @Query(() => Game, {
    nullable: true,
    description: GAME_DESCRIPTIONS.FIND_ONE,
  })
  game(
    @Arg('id', () => ObjectIdScalar, {
      description: GAME_DESCRIPTIONS.ID,
    })
    id: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return ctx.loaders.GameLoader.load(id);
  }

  // get multiple games
  @Query(() => [Game], {
    description: GAME_DESCRIPTIONS.FIND,
  })
  async games(
    @Arg('ids', () => [ObjectIdScalar], {
      nullable: true,
      description: GAME_DESCRIPTIONS.IDS,
    })
    ids: Array<ObjectId>,
    @Arg('search', {
      nullable: true,
    })
    search: string,
    @Arg('sort', () => GAME_SORT, {
      nullable: true,
      defaultValue: GAME_SORT.NAME_ASC,
    })
    sort: GAME_SORT,
    @Ctx() ctx: Context,
  ) {
    return GameResolverMethods.games({
      ctx,
      ids,
      search,
      sort,
    });
  }

  // add characters field to game
  @FieldResolver(() => [Character], {
    description: GAME_DESCRIPTIONS.CHARACTERS,
    nullable: true,
  })
  characters(
    @Root() game: DocumentType<Game>,
    @Arg('search', {
      nullable: true,
    })
    search: string,
    @Arg('sort', () => CHARACTER_SORT, {
      nullable: true,
      defaultValue: CHARACTER_SORT.GAME_ID,
    })
    sort: CHARACTER_SORT,
    @Ctx() ctx: Context,
  ) {
    return CharacterMethodResolver.characters({
      ctx,
      sort,
      search,
      game: game._id,
    });
  }

  // TODO: Add tournaments that feature this game

  // TODO: Add tournament series that feature this game

  // game elo, also search and sort
  @FieldResolver(() => [GameElo], {
    description: GAME_DESCRIPTIONS.GAME_ELO,
    nullable: true,
  })
  game_elos(
    @Root() game: DocumentType<Game>,
    @Arg('players', () => [ObjectIdScalar], {
      nullable: true,
      description: GAME_ELO_DESCRIPTIONS.PLAYER_IDS,
    })
    players: Array<ObjectId>,
    @Arg('sort', () => GAME_ELO_SORT, {
      nullable: true,
      defaultValue: GAME_ELO_SORT.SCORE_DESC,
    })
    sort: GAME_ELO_SORT,
    @Ctx() ctx: Context,
  ) {
    return GameEloResolverMethods.game_elos({
      games: [game._id],
      players,
      sort,
      ctx,
    });
  }

  // TODO: add tournament series elo
}
