import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import validator from 'validator';
import { Player } from '@models/player';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

export class PlayerSocial {
  @Property({
    required: true,
    ref: () => Player,
  })
  public player!: Ref<Player>;

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

export const PlayerSocialModel = getModelForClass(PlayerSocial, {
  options: {
    customName: 'PlayerSocial',
  },
  schemaOptions: {
    collection: 'player_social',
  },
});
