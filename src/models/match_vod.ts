import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { Vod } from '@models/vod';
import { Match } from '@models/match';
import { Character } from '@models/character';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum MATCH_VOD_DESCRIPTIONS {
  DESCRIPTION = 'Information about a match on a VOD/video, with characters if available',
  ID = 'Unique identifier for this match video',
  IDS = 'List of unique identifiers (_id) of one or more match videos',
  VOD = 'VOD/video that this match is on',
  VOD_ID = 'Unique identifier (_id) of a VOD/video that this match is on',
  VOD_IDS = 'Unique identifiers (_id) of one or more VOD/videos that have match videos',
  MATCH = 'Match information that this match video refers to',
  MATCH_ID = 'Unique identifier (_id) of a match information that this match video refers to',
  MATCH_IDS = 'Unique identifiers (_id) of one or more match informations that contain match videos',
  CHARACTERS = 'Characters that appear in the particular match video',
  CHARACTER_IDS = 'Unique identifiers (_id) of characters that appear in match videos',
  TIMESTAMP = 'Timestamp on the VOD that this match video begins',
  FIND_ONE = 'Find and get single match vod by id, or match and vod',
  FIND = 'Find and get some or all match vods',
}

@ObjectType({
  description: MATCH_VOD_DESCRIPTIONS.DESCRIPTION,
})
@Index({ vod: 1 })
@Index({ match: 1 })
@Index({ match: 1, vod: 1 })
@Index({ characters: 1 })
export class MatchVod {
  @Field({
    description: MATCH_VOD_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Vod, {
    description: MATCH_VOD_DESCRIPTIONS.VOD,
  })
  @Property({
    required: true,
    ref: () => Vod,
  })
  public vod!: Ref<Vod>;

  @Field(() => Match, {
    description: MATCH_VOD_DESCRIPTIONS.MATCH,
  })
  @Property({
    required: true,
    ref: () => Match,
  })
  public match!: Ref<Match>;

  @Field(() => [Character], {
    description: MATCH_VOD_DESCRIPTIONS.CHARACTERS,
    defaultValue: [],
  })
  @Property({
    ref: () => Character,
  })
  public characters?: Array<Ref<Character>>;

  @Field({
    description: MATCH_VOD_DESCRIPTIONS.TIMESTAMP,
  })
  @Property({
    default: '0',
  })
  public timestamp?: string;
}

export const MatchVodModel = getModelForClass(MatchVod, {
  options: {
    customName: 'MatchVod',
  },
  schemaOptions: {
    collection: 'match_vod',
  },
});
