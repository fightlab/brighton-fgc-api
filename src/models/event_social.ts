import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { Event } from '@models/event';

export class EventSocial {
  @Property({
    required: true,
    ref: () => Event,
  })
  public event!: Ref<Event>;

  @Property()
  public facebook?: string;

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

  @Property()
  public twitter?: string;

  @Property()
  public discord?: string;

  @Property()
  public instagram?: string;

  @Property()
  public meta?: any;

  @Property()
  public twitch?: string;

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
