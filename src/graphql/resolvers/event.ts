// GraphQL Resolver for Events

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
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { Event, EVENT_DESCRIPTIONS } from '@models/event';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { Venue } from '@models/venue';
import {
  EventSeriesResolverMethods,
  EventSeriesArgs,
} from '@graphql/resolvers/event_series';
import { EventSeries } from '@models/event_series';
import { EventSocialResolverMethods } from '@graphql/resolvers/event_social';
import { EventSocial } from '@models/event_social';
import {
  TournamentResolverMethodsClass,
  TournamentsArgs,
} from '@graphql/resolvers/tournament';
import { Tournament } from '@models/tournament';

export enum EVENT_SORT {
  NAME_ASC,
  NAME_DESC,
  DATE_START_ASC,
  DATE_START_DESC,
  DATE_END_ASC,
  DATE_END_DESC,
  VENUE_ID,
  ID,
}

registerEnumType(EVENT_SORT, {
  name: 'EventSort',
  description: 'Sort events by this enum',
});

const mapSort = (sort: EVENT_SORT): MapSort => {
  switch (sort) {
    case EVENT_SORT.NAME_ASC:
      return ['name', 'asc'];
    case EVENT_SORT.NAME_DESC:
      return ['name', 'desc'];
    case EVENT_SORT.DATE_START_ASC:
      return ['date_start', 'asc'];
    case EVENT_SORT.DATE_START_DESC:
      return ['date_start', 'desc'];
    case EVENT_SORT.DATE_END_ASC:
      return ['date_end', 'asc'];
    case EVENT_SORT.DATE_END_DESC:
      return ['date_end', 'desc'];
    case EVENT_SORT.VENUE_ID:
      return ['venue', 'asc'];
    default:
      return ['_id', 'asc'];
  }
};

@ArgsType()
export class EventsArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: EVENT_DESCRIPTIONS.IDS,
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

  @Field(() => ObjectIdScalar, {
    nullable: true,
    description: EVENT_DESCRIPTIONS.VENUE_ID,
  })
  venue?: ObjectId;

  @Field(() => EVENT_SORT, {
    nullable: true,
    defaultValue: EVENT_SORT.DATE_START_DESC,
  })
  sort!: EVENT_SORT;
}

export class EventResolverMethodsClass {
  static async events({
    ids,
    search,
    date_start_gte,
    date_start_lte,
    date_end_gte,
    date_end_lte,
    venue,
    sort = EVENT_SORT.DATE_START_DESC,
    ctx,
  }: {
    ids?: Array<ObjectId>;
    search?: string;
    date_start_gte?: Date;
    date_start_lte?: Date;
    date_end_gte?: Date;
    date_end_lte?: Date;
    venue?: ObjectId;
    sort?: EVENT_SORT;
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

    if (venue) {
      q.venue = venue;
    }

    const events = await ctx.loaders.EventsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(events, iteratee, orders);
  }
}

@Resolver(() => Event)
export class EventResolver {
  // get single event
  @Query(() => Event, {
    nullable: true,
    description: EVENT_DESCRIPTIONS.FIND_ONE,
  })
  event(
    @Arg('id', () => ObjectIdScalar, {
      description: EVENT_DESCRIPTIONS.ID,
    })
    id: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return ctx.loaders.EventLoader.load(id);
  }

  // get multiple events
  @Query(() => [Event], {
    description: EVENT_DESCRIPTIONS.FIND,
  })
  events(
    @Args()
    {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      ids,
      search,
      venue,
    }: EventsArgs,
    @Ctx() ctx: Context,
  ) {
    return EventResolverMethodsClass.events({
      ids,
      ctx,
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      search,
      venue,
    });
  }

  // add field onto event to return the venue id
  @FieldResolver(() => ObjectIdScalar, {
    description: EVENT_DESCRIPTIONS.VENUE_ID,
  })
  venue_id(@Root() event: DocumentType<Event>) {
    return event.venue;
  }

  // populate venue
  @FieldResolver(() => Venue, {
    description: EVENT_DESCRIPTIONS.VENUE,
  })
  venue(@Root() event: DocumentType<Event>, @Ctx() ctx: Context) {
    return ctx.loaders.VenueLoader.load(event.venue);
  }

  // populate event series
  @FieldResolver(() => EventSeries, {
    description: EVENT_DESCRIPTIONS.EVENT_SERIES,
    nullable: true,
  })
  async event_series(
    @Root() event: DocumentType<Event>,
    @Args() { sort, search, ids }: EventSeriesArgs,
    @Ctx() ctx: Context,
  ) {
    const [eventSeries = null] = await EventSeriesResolverMethods.event_series({
      events: [event._id],
      sort,
      search,
      ids,
      ctx,
    });

    return eventSeries;
  }

  // populate event social
  @FieldResolver(() => EventSocial, {
    description: EVENT_DESCRIPTIONS.EVENT_SOCIAL,
    nullable: true,
  })
  event_social(@Root() event: DocumentType<Event>, @Ctx() ctx: Context) {
    return EventSocialResolverMethods.event_social({
      ctx,
      event: event._id,
    });
  }

  // populate tournaments
  @FieldResolver(() => [Tournament])
  tournaments(
    @Root() event: DocumentType<Event>,
    @Args(() => TournamentsArgs)
    {
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      games,
      ids,
      players,
      search,
      type,
    }: TournamentsArgs,
    @Ctx() ctx: Context,
  ) {
    return TournamentResolverMethodsClass.tournaments({
      event: event._id,
      sort,
      date_end_gte,
      date_end_lte,
      date_start_gte,
      date_start_lte,
      games,
      ids,
      players,
      search,
      type,
      ctx,
    });
  }
}
