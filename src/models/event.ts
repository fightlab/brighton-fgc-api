import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { isDate } from 'moment';
import { Venue } from '@models/venue';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum EVENT_DESCRIPTIONS {
  DESCRIPTION = 'Events that have taken place',
  ID = 'Unique identifier of the event',
  IDS = 'List of unique identifiers (_id) of multiple events',
  NAME = 'Name of the event',
  DATE_START = 'Date and time that the event started',
  DATE_END = 'Date and time that the event finished',
  VENUE = 'The venue where the event took place',
  VENUE_ID = 'The unique identifier (_id) of the venue where the event took place',
  SHORT = 'Shorthand of the event',
  INFO = 'Additional information about the event as a markdown string',
  FIND_ONE = 'Find and get a singe event by id',
  FIND = 'Find and get some or all events',
  EVENT_SERIES = 'The series that this event belongs to',
  EVENT_SOCIAL = 'Social media information for this event',
}

@ObjectType({
  description: EVENT_DESCRIPTIONS.DESCRIPTION,
})
@Index({ name: 1 })
@Index({ date_start: -1 })
@Index({ date_end: -1 })
@Index({ date_start: -1, date_end: -1 })
@Index({ date_start: 1, date_end: 1 })
@Index({ venue: 1 })
export class Event {
  //only in graphql
  @Field({
    description: EVENT_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: EVENT_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  public name!: string;

  @Field({
    description: EVENT_DESCRIPTIONS.DATE_START,
  })
  @Property({
    required: true,
    validate: {
      validator: function (this: Event) {
        if (
          !isDate(this.date_end) ||
          this.date_end.getTime() < this.date_start.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: generateValidationMessage(
        'date_start',
        VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
      ),
    },
  })
  public date_start!: Date;

  @Field({
    description: EVENT_DESCRIPTIONS.DATE_END,
  })
  @Property({
    required: true,
    validate: {
      validator: function (this: Event) {
        if (
          !isDate(this.date_start) ||
          this.date_start.getTime() > this.date_end.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: generateValidationMessage(
        'date_end',
        VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
      ),
    },
  })
  public date_end!: Date;

  @Field(() => Venue, {
    description: EVENT_DESCRIPTIONS.VENUE,
  })
  @Property({
    required: true,
    ref: () => Venue,
  })
  public venue!: Ref<Venue>;

  @Field({
    description: EVENT_DESCRIPTIONS.SHORT,
    nullable: true,
  })
  @Property()
  public short?: string;

  @Field({
    description: EVENT_DESCRIPTIONS.INFO,
    nullable: true,
  })
  @Property()
  public info?: string;
}

export const EventModel = getModelForClass(Event, {
  options: {
    customName: 'Event',
  },
  schemaOptions: {
    collection: 'event',
  },
});
