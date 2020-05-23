import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export class VodPlatformClass {
  @Property({ required: true })
  public name!: string;

  @Property({
    required: true,
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public url!: string;

  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'watch_url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public watch_url?: string;

  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'embed_url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public embed_url?: string;
}

export const VodPlatform = getModelForClass(VodPlatformClass, {
  options: {
    customName: 'VodPlatform',
  },
  schemaOptions: {
    collection: 'vod_platform',
  },
});
