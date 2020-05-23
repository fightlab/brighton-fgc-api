import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { BracketPlatformClass } from '@models/bracket_platform';
import { TournamentClass } from '@models/tournament';

export class BracketClass {
  @Property({
    required: true,
    ref: () => TournamentClass,
  })
  public tournament!: Ref<TournamentClass>;

  @Property({
    required: true,
    ref: () => BracketPlatformClass,
  })
  public platform!: Ref<BracketPlatformClass>;

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

export const Bracket = getModelForClass(BracketClass, {
  options: {
    customName: 'Bracket',
  },
  schemaOptions: {
    collection: 'bracket',
  },
});
