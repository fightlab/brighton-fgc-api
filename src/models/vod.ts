import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { VodPlatform } from '@models/vod_platform';
import { Tournament } from '@models/tournament';
import validator from 'validator';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum VOD_DESCRIPTIONS {
  DESCRIPTION = 'Video on demand (VOD or video), for a tournament hosted on a give platform',
  ID = 'Unique identifier for this video',
  IDS = 'List of unique identifiers (_id) of one or more videos',
  TOURNAMENT = 'Tournament that this video belongs to',
  TOURNAMENT_ID = 'Unique identifier (_id) of a tournament that a video belongs to',
  TOURNAMENT_IDS = 'Unique identifiers (_id) of one or more tournaments that have VODa',
  VOD_PLATFORM = 'Platform that the video is hosted on',
  VOD_PLATFORM_ID = 'Unique identifier (_id) of a platform that a video is hosted on',
  VOD_PLATFORM_IDS = 'Unique identifiers (_id) of one or more platforms that have VODs',
  PLATFORM_ID = 'The ID or slug of the video on the platform site, e.g. YouTube watch id',
  URL = 'URL link to the video on the platform site',
  START_TIME = 'Timestamp of when then video starts on that VOD',
  FIND_ONE = 'Find and get a single video by id or by tournament',
  FIND = 'Find and get some or all videos',
}

@ObjectType({
  description: VOD_DESCRIPTIONS.DESCRIPTION,
})
@Index({ tournament: 1, platform: 1 })
@Index({ tournament: 1 })
@Index({ platform: 1 })
export class Vod {
  @Field({
    description: VOD_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Tournament, {
    description: VOD_DESCRIPTIONS.TOURNAMENT,
  })
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournament!: Ref<Tournament>;

  @Field(() => VodPlatform, {
    description: VOD_DESCRIPTIONS.VOD_PLATFORM,
    name: 'vod_platform',
  })
  @Property({
    required: true,
    ref: () => VodPlatform,
  })
  public platform!: Ref<VodPlatform>;

  @Field({
    description: VOD_DESCRIPTIONS.PLATFORM_ID,
  })
  @Property({ required: true })
  public platform_id!: string;

  @Field({
    description: VOD_DESCRIPTIONS.URL,
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
    description: VOD_DESCRIPTIONS.START_TIME,
  })
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
