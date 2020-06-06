import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { default as validator } from 'validator';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { BracketPlatform } from '@models/bracket_platform';
import { Tournament } from '@models/tournament';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum BRACKET_DESCRIPTIONS {
  DESCRIPTION = 'Tournament bracket information from a given platform',
  ID = 'Unique identifier for this tournament bracket',
  IDS = 'List of unique identifiers (_id) of one or more tournament brackets',
  TOURNAMENT = 'The tournament that this bracket belongs to',
  TOURNAMENT_ID = 'The unique identifier (_id) of the tournament that this bracket belongs to',
  BRACKET_PLATFORM = 'The platform that this bracket is hosted on',
  BRACKET_PLATFORM_ID = 'The unique identifier (_id) of the platform that this bracket is hosted on',
  PLATFORM_ID = 'The id as given by the platform for this bracket',
  URL = 'URL of this bracket on a platform',
  SLUG = 'Slug of this bracket on a platform',
  IMAGE = 'Image URL of the bracket on a platform',
  FIND_ONE = 'Get a single bracket for a tournament by id, or tournament id',
  FIND = 'Get a list of brackets depending on provided query parameters',
}

@ObjectType()
@Index({ tournament: 1 })
@Index({ platform: 1 })
@Index({ platform_id: 1 })
@Index({ slug: 1 })
export class Bracket {
  //only in graphql
  @Field({
    description: BRACKET_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Tournament, {
    description: BRACKET_DESCRIPTIONS.TOURNAMENT,
  })
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournament!: Ref<Tournament>;

  @Field(() => BracketPlatform, {
    description: BRACKET_DESCRIPTIONS.BRACKET_PLATFORM,
    name: 'bracket_platform',
  })
  @Property({
    required: true,
    ref: () => BracketPlatform,
  })
  public platform!: Ref<BracketPlatform>;

  @Field({
    description: BRACKET_DESCRIPTIONS.PLATFORM_ID,
  })
  @Property({ required: true })
  public platform_id!: string;

  @Field({
    description: BRACKET_DESCRIPTIONS.URL,
    nullable: true,
  })
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

  @Field({
    description: BRACKET_DESCRIPTIONS.SLUG,
    nullable: true,
  })
  @Property()
  public slug?: string;

  @Field({
    description: BRACKET_DESCRIPTIONS.IMAGE,
    nullable: true,
  })
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
