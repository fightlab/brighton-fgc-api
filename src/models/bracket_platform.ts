// Bracket Platform Model
// The platform on which tournament brackets are hosted on
// e.g. challonge / smash.gg / offline pen+paper

import {
  prop as Property,
  getModelForClass,
  Severity,
  index as Index,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { default as validator } from 'validator';
import { default as mongoose } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export enum BRACKET_PLATFORM_DESCRIPTIONS {
  DESCRIPTION = 'Platform information on which brackets are hosted on',
  ID = 'Unique identifier of the platform',
  NAME = 'Name of the platform',
  URL = 'URL of the platform',
  API_URL = 'API URL endpoint if the platform has one',
  API_DOCS = 'API documentation if the platform has one',
  FIND_ONE = 'Find and get a single platform that brackets are hosted on',
  FIND = 'Find and get all platforms that brackets are hosted on',
}

@ObjectType({
  description: BRACKET_PLATFORM_DESCRIPTIONS.DESCRIPTION,
})
@Index({ name: 'text' })
export class BracketPlatform {
  @Field({
    description: BRACKET_PLATFORM_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: BRACKET_PLATFORM_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  public name!: string;

  @Field({
    nullable: true,
    description: BRACKET_PLATFORM_DESCRIPTIONS.URL,
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
    nullable: true,
    description: BRACKET_PLATFORM_DESCRIPTIONS.API_URL,
  })
  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'api_url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public api_url?: string;

  @Field({
    nullable: true,
    description: BRACKET_PLATFORM_DESCRIPTIONS.API_DOCS,
  })
  @Property({
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'api_docs',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  })
  public api_docs?: string;

  @Property({ type: mongoose.Schema.Types.Mixed })
  meta?: any;
}

export const BracketPlatformModel = getModelForClass(BracketPlatform, {
  options: {
    customName: 'BracketPlatform',
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    collection: 'bracket_platform',
  },
});
