import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import validator from 'validator';
import { PlayerClass } from '@models/player';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

export class PlayerSocialClass {
  @Property({
    required: true,
    ref: () => PlayerClass,
  })
  public player!: Ref<PlayerClass>;

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
  public github?: string;

  @Property()
  public twitch?: string;

  @Property()
  public youtube?: string;

  @Property()
  public playstation?: string;

  @Property()
  public xbox?: string;

  @Property()
  public switch?: string;
}

export const PlayerSocial = getModelForClass(PlayerSocialClass, {
  options: {
    customName: 'PlayerSocial',
  },
  schemaOptions: {
    collection: 'player_social',
  },
});
