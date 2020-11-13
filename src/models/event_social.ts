import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { Event } from '@models/event';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum EVENT_SOCIAL_DESCRIPTIONS {
  DESCRIPTION = 'Social media links for a given event',
  ID = 'Unique identifier of the event social',
  EVENT = 'Event that this social media information belongs to',
  EVENT_ID = 'Unique identifier of the event the social media information belongs to',
  FACEBOOK = 'Facebook event link',
  WEB = 'Web link',
  TWITTER = 'Twitter tweet link',
  DISCORD = 'Discord server link',
  INSTAGRAM = 'Instagram post link',
  TWITCH = 'Twitch link',
  YOUTUBE = 'YouTube link',
  FIND = 'Find social media information from a given event',
}

@ObjectType({
  description: EVENT_SOCIAL_DESCRIPTIONS.DESCRIPTION,
})
@Index({ event: 1 })
export class EventSocial {
  @Field({
    description: EVENT_SOCIAL_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Event, {
    description: EVENT_SOCIAL_DESCRIPTIONS.EVENT,
  })
  @Property({
    required: true,
    ref: () => Event,
  })
  public event!: Ref<Event>;

  @Field({
    description: EVENT_SOCIAL_DESCRIPTIONS.FACEBOOK,
    nullable: true,
  })
  @Property()
  public facebook?: string;

  @Field({
    description: EVENT_SOCIAL_DESCRIPTIONS.WEB,
    nullable: true,
  })
  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'web',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public web?: string;

  @Field({
    description: EVENT_SOCIAL_DESCRIPTIONS.TWITTER,
    nullable: true,
  })
  @Property()
  public twitter?: string;

  @Field({
    description: EVENT_SOCIAL_DESCRIPTIONS.DISCORD,
    nullable: true,
  })
  @Property()
  public discord?: string;

  @Field({
    description: EVENT_SOCIAL_DESCRIPTIONS.INSTAGRAM,
    nullable: true,
  })
  @Property()
  public instagram?: string;

  @Field({
    description: EVENT_SOCIAL_DESCRIPTIONS.TWITCH,
    nullable: true,
  })
  @Property()
  public twitch?: string;

  @Field({
    description: EVENT_SOCIAL_DESCRIPTIONS.YOUTUBE,
    nullable: true,
  })
  @Property()
  public youtube?: string;
}

export const EventSocialModel = getModelForClass(EventSocial, {
  options: {
    customName: 'EventSeries',
  },
  schemaOptions: {
    collection: 'event_social',
  },
});
