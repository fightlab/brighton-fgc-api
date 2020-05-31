import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { Event } from '@models/event';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum EVENT_SERIES_DESCRIPTIONS {
  DESCRIPTION = 'A group of events can be described together as an event series',
  ID = 'Unique identifier of the event series',
  IDS = 'List of unique identifiers (_id) of event series',
  NAME = 'Name of the event series',
  EVENTS = 'List of events that belong to this event series',
  EVENT_IDS = 'List of event ids that belong to this event series',
  INFO = 'Additional information about this event series',
  FIND = 'Get a list of event series, or search for a particular event series',
}

@ObjectType({
  description: EVENT_SERIES_DESCRIPTIONS.DESCRIPTION,
})
@Index({ name: 1 })
@Index({ events: 1 })
export class EventSeries {
  @Field({
    description: EVENT_SERIES_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: EVENT_SERIES_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  public name!: string;

  @Field(() => [Event], {
    description: EVENT_SERIES_DESCRIPTIONS.EVENTS,
  })
  @Property({
    required: true,
    ref: () => Event,
    default: [],
  })
  public events!: Array<Ref<Event>>;

  @Field({
    description: EVENT_SERIES_DESCRIPTIONS.INFO,
    nullable: true,
  })
  @Property()
  public info?: string;
}

export const EventSeriesModel = getModelForClass(EventSeries, {
  options: {
    customName: 'EventSeries',
  },
  schemaOptions: {
    collection: 'event_series',
  },
});
