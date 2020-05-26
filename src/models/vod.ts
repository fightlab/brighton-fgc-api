import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { VodPlatform } from '@models/vod_platform';
import { Tournament } from '@models/tournament';
import validator from 'validator';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

export class Vod {
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournament!: Ref<Tournament>;

  @Property({
    required: true,
    ref: () => VodPlatform,
  })
  public platform!: Ref<VodPlatform>;

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

export const VodModel = getModelForClass(Vod, {
  options: {
    customName: 'Vod',
  },
  schemaOptions: {
    collection: 'vod',
  },
});
