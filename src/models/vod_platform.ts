import {
  prop as Property,
  getModelForClass,
  Index,
} from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum VOD_PLATFORM_DESCRIPTIONS {
  DESCRIPTION = 'Platform information on which VODs (Video on Demand) are hosted on',
  ID = 'Unique identifier of the platform',
  IDS = 'List of unique identifiers (_id) of multiple platforms',
  NAME = 'Name of the platform',
  URL = 'URL of the platform',
  WATCH_URL = 'URL used to link to VOD',
  EMBED_URL = 'URL used to embed the VOD',
  FIND_ONE = 'Find and get a single platform that VODs are hosted on',
  FIND = 'Find and get some or all platforms that VODs are hosted on',
}

@ObjectType({
  description: VOD_PLATFORM_DESCRIPTIONS.DESCRIPTION,
})
@Index({ name: 'text' })
export class VodPlatform {
  @Field({
    description: VOD_PLATFORM_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: VOD_PLATFORM_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  public name!: string;

  @Field({
    description: VOD_PLATFORM_DESCRIPTIONS.URL,
  })
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

  @Field({
    nullable: true,
    description: VOD_PLATFORM_DESCRIPTIONS.WATCH_URL,
  })
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

  @Field({
    nullable: true,
    description: VOD_PLATFORM_DESCRIPTIONS.EMBED_URL,
  })
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

export const VodPlatformModel = getModelForClass(VodPlatform, {
  options: {
    customName: 'VodPlatform',
  },
  schemaOptions: {
    collection: 'vod_platform',
  },
});
