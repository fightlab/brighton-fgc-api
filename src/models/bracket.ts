import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { BracketPlatform } from '@models/bracket_platform';
import { Tournament } from '@models/tournament';

export class Bracket {
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournament!: Ref<Tournament>;

  @Property({
    required: true,
    ref: () => BracketPlatform,
  })
  public platform!: Ref<BracketPlatform>;

  @Property({ required: true })
  public platform_id!: string;

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

  @Property()
  public slug?: string;

  @Property()
  public image?: string;
}

export const BracketModel = getModelForClass(Bracket, {
  options: {
    customName: 'Bracket',
  },
  schemaOptions: {
    collection: 'bracket',
  },
});
