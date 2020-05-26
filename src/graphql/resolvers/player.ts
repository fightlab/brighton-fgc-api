import { Resolver, Query, Ctx, Arg, registerEnumType } from 'type-graphql';
import { Player, PLAYER_DESCRIPTIONS } from '@models/player';
import { Context } from '@lib/graphql';
import {
  generateMongooseQueryObject,
  MapSort,
  MongooseQuery,
} from '@graphql/resolvers';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { orderBy } from 'lodash';

enum PLAYER_SORT {
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

@Resolver(() => Player)
export class PlayerResolver {
  // get a single player
  @Query(() => Player, {
    nullable: true,
    description: PLAYER_DESCRIPTIONS.FIND_ONE,
  })
  player(
    @Arg('id', () => ObjectIdScalar, {
      description: PLAYER_DESCRIPTIONS.ID,
    })
    id: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return ctx.loaders.PlayerLoader.load(id);
  }

  // get multiple players
  @Query(() => [Player], {
    description: PLAYER_DESCRIPTIONS.FIND,
  })
  async players(
    @Arg('ids', () => [ObjectIdScalar], {
      nullable: true,
      description: PLAYER_DESCRIPTIONS.IDS,
    })
    ids: Array<ObjectId>,
    @Arg('search', {
      nullable: true,
    })
    search: string,
    @Arg('sort', () => PLAYER_SORT, {
      nullable: true,
      defaultValue: PLAYER_SORT.HANDLE_ASC,
    })
    sort: PLAYER_SORT,
    @Ctx() ctx: Context,
  ) {
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
