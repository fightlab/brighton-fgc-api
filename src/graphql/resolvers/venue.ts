import {
  registerEnumType,
  Resolver,
  Query,
  Ctx,
  FieldResolver,
  Root,
  Args,
  ArgsType,
  Field,
} from 'type-graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { Event } from '@models/event';
import { Venue, VENUE_DESCRIPTIONS } from '@models/venue';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { Context, CtxWithArgs } from '@lib/graphql';
import { orderBy } from 'lodash';
import { EventResolverMethods, EventsArgs } from '@graphql/resolvers/event';
import { DocumentType } from '@typegoose/typegoose';

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

@ArgsType()
export class VenueArgs {
  @Field(() => ObjectIdScalar, {
    description: VENUE_DESCRIPTIONS.ID,
  })
  id!: ObjectId;
}

@ArgsType()
export class VenuesArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: VENUE_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field({
    nullable: true,
  })
  search?: string;

  @Field(() => VENUE_SORT, {
    nullable: true,
    defaultValue: VENUE_SORT.NAME_ASC,
  })
  sort!: VENUE_SORT;
}

export class VenueResolverMethods {
  static venue({
    args: { id },
    ctx,
  }: CtxWithArgs<VenueArgs>): Promise<Venue | null> {
    return ctx.loaders.VenueLoader.load(id);
  }

  static async venues({
    args: { search, sort, ids },
    ctx,
  }: CtxWithArgs<VenuesArgs>): Promise<Array<Venue>> {
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
}

@Resolver(() => Venue)
export class VenueResolver {
  // get a single venue
  @Query(() => Venue, {
    nullable: true,
    description: VENUE_DESCRIPTIONS.FIND_ONE,
  })
  venue(@Args() { id }: VenueArgs, @Ctx() ctx: Context): Promise<Venue | null> {
    return VenueResolverMethods.venue({ args: { id }, ctx });
  }

  // get multiple venues
  @Query(() => [Venue], {
    description: VENUE_DESCRIPTIONS.FIND,
  })
  async venues(
    @Args() { sort, ids, search }: VenuesArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Venue>> {
    return VenueResolverMethods.venues({ ctx, args: { sort, ids, search } });
  }

  // get events that have taken place at this venue
  @FieldResolver(() => [Event], {
    description: VENUE_DESCRIPTIONS.EVENTS,
  })
  events(
    @Root() venue: DocumentType<Venue>,
    @Args(() => EventsArgs)
    {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      ids,
      search,
    }: EventsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Event>> {
    return EventResolverMethods.events({
      ctx,
      args: {
        venue: venue._id,
        sort,
        date_end_gte,
        date_end_lte,
        date_start_gte,
        date_start_lte,
        search,
        ids,
      },
    });
  }
}
