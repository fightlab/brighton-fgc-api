import {
  prop as Property,
  getModelForClass,
  Index,
} from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum VENUE_DESCRIPTIONS {
  DESCRIPTION = 'Information about venues events take place at',
  ID = 'Unique identifier of this venue',
  IDS = 'List of unique identifiers (_id) of multiple venues',
  NAME = 'Name of the venue',
  SHORT = 'Shorthand name of the venue',
  ADDRESS = 'Address of the venue',
  GOOGLE_MAPS = 'Google Maps link to the venue',
  WEBSITE = 'Website of the venue',
  FIND_ONE = 'Find and get a single venue by id',
  FIND = 'Find and get some or all venues',
  EVENTS = 'Events that have taken place at this venue',
}

@ObjectType({
  description: VENUE_DESCRIPTIONS.DESCRIPTION,
})
@Index({ name: 1 })
export class Venue {
  // only in gql
  @Field({
    description: VENUE_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: VENUE_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  public name!: string;

  @Field({
    description: VENUE_DESCRIPTIONS.SHORT,
  })
  @Property({ required: true })
  public short!: string;

  @Field({
    description: VENUE_DESCRIPTIONS.ADDRESS,
    nullable: true,
  })
  @Property()
  public address?: string;

  @Field({
    description: VENUE_DESCRIPTIONS.GOOGLE_MAPS,
    nullable: true,
  })
  @Property()
  public google_maps?: string;

  @Field({
    description: VENUE_DESCRIPTIONS.WEBSITE,
    nullable: true,
  })
  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'website',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public website?: string;
}

export const VenueModel = getModelForClass(Venue, {
  options: {
    customName: 'Venue',
  },
  schemaOptions: {
    collection: 'venue',
  },
});
