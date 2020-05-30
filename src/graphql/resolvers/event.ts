// GraphQL Resolver for Events

import {
  registerEnumType,
  Resolver,
  Arg,
  Ctx,
  Query,
  FieldResolver,
  Root,
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
  async events(
    @Arg('ids', () => [ObjectIdScalar], {
      nullable: true,
      description: EVENT_DESCRIPTIONS.IDS,
    })
    ids: Array<ObjectId>,
    @Arg('search', {
      nullable: true,
    })
    search: string,
    @Arg('sort', () => EVENT_SORT, {
      nullable: true,
      defaultValue: EVENT_SORT.DATE_START_DESC,
    })
    sort: EVENT_SORT,
    @Arg('date_start_gte', {
      nullable: true,
    })
    date_start_gte: Date,
    @Arg('date_start_lte', {
      nullable: true,
    })
    date_start_lte: Date,
    @Arg('date_end_gte', {
      nullable: true,
    })
    date_end_gte: Date,
    @Arg('date_end_lte', {
      nullable: true,
    })
    date_end_lte: Date,
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

    const events = await ctx.loaders.EventsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(events, iteratee, orders);
  }

  // add field onto character to return the game id
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

  // TODO: populate tournaments
}
