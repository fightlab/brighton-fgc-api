import {
  prop as Property,
  getModelForClass,
  Severity,
} from '@typegoose/typegoose';
import { default as validator } from 'validator';
import { default as mongoose } from 'mongoose';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export class BracketPlatformClass {
  @Property({ required: true })
  public name!: string;

  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public url?: string;

  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'api_url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public api_url?: string;

  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'api_docs',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public api_docs?: string;

  @Property({ type: mongoose.Schema.Types.Mixed })
  meta?: any;
}

export const BracketPlatform = getModelForClass(BracketPlatformClass, {
  options: {
    customName: 'BracketPlatform',
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    collection: 'bracket_platform',
  },
});
