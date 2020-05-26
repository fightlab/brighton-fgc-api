import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export class Venue {
  @Property({ required: true })
  public name!: string;

  @Property({ required: true })
  public short!: string;

  @Property()
  public address?: string;

  @Property()
  public google_maps?: string;

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
