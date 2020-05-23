import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { VodPlatformClass } from '@models/vod_platform';
import { TournamentClass } from '@models/tournament';
import validator from 'validator';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

export class VodClass {
  @Property({
    required: true,
    ref: () => TournamentClass,
  })
  public tournament!: Ref<TournamentClass>;

  @Property({
    required: true,
    ref: () => VodPlatformClass,
  })
  public platform!: Ref<VodPlatformClass>;

  @Property({ required: true })
  public platform_id!: string;

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

  @Property({ default: '0' })
  public start_time?: string;
}

export const Vod = getModelForClass(VodClass, {
  options: {
    customName: 'Vod',
  },
  schemaOptions: {
    collection: 'vod',
  },
});
