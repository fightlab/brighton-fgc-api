import { registerEnumType, Resolver, Query, Ctx, Arg } from 'type-graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { Venue, VENUE_DESCRIPTIONS } from '@models/venue';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { Context } from '@lib/graphql';
import { orderBy } from 'lodash';

enum VENUE_SORT {
  NAME_ASC,
  NAME_DESC,
  ID,
}

registerEnumType(VENUE_SORT, {
  name: 'VenueSort',
  description: 'Sort venues by this enum',
});

const mapSort = (sort: VENUE_SORT): MapSort => {
  switch (sort) {
    case VENUE_SORT.NAME_ASC:
      return ['name', 'asc'];
    case VENUE_SORT.NAME_DESC:
      return ['name', 'desc'];
    default:
      return ['_id', 'asc'];
  }
};

@Resolver(() => Venue)
export class VenueResolver {
  // get a single venue
  @Query(() => Venue, {
    nullable: true,
    description: VENUE_DESCRIPTIONS.FIND_ONE,
  })
  venue(
    @Arg('id', () => ObjectIdScalar, {
      description: VENUE_DESCRIPTIONS.ID,
    })
    id: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return ctx.loaders.VenueLoader.load(id);
  }

  // get multiple venues
  @Query(() => [Venue], {
    description: VENUE_DESCRIPTIONS.FIND,
  })
  async venues(
    @Arg('ids', () => [ObjectIdScalar], {
      nullable: true,
      description: VENUE_DESCRIPTIONS.IDS,
    })
    ids: Array<ObjectId>,
    @Arg('search', {
      nullable: true,
    })
    search: string,
    @Arg('sort', () => VENUE_SORT, {
      nullable: true,
      defaultValue: VENUE_SORT.NAME_ASC,
    })
    sort: VENUE_SORT,
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

    const venues = await ctx.loaders.VenuesLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(venues, iteratee, orders);
  }

  // TODO: get events that have taken place at this venue
}
