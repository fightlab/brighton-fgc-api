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

// sorting stuff for game
enum GAME_SORT {
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

  // add characters field to game
  @FieldResolver(() => [Character], { nullable: true })
  characters(@Root() game: DocumentType<Game>, @Ctx() ctx: Context) {
    return ctx.loaders.CharactersLoader.load({ game: game.id });
  }
}
