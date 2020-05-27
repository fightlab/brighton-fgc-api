// Game Model
// The games that have previously been run as tournaments

import { default as mongoose } from 'mongoose';
import {
  prop as Property,
  getModelForClass,
  Severity,
  Index,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum GAME_DESCRIPTIONS {
  DESCRIPTIONS = 'Information on games that have been run as tournaments',
  ID = 'Unique identifier of the game',
  IDS = 'List of unique identifiers (_id) of multiple games',
  NAME = 'Name of the game',
  SHORT = 'Shorthand name of the game',
  LOGO = 'Image URL for the game logo',
  BG = 'Image URL for the game background',
  CHARACTERS = 'Characters from this game that have appeared in VODs',
  FIND_ONE = 'Find and get a single game by id',
  FIND = 'Find and get some or all games',
  GAME_ELO = 'Player elo rankings for this game',
}

@ObjectType({
  description: GAME_DESCRIPTIONS.DESCRIPTIONS,
})
@Index({ name: 1 })
@Index({ short: 1 })
export class Game {
  // only in graphql
  @Field({
    description: GAME_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: GAME_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  public name!: string;

  @Field({
    description: GAME_DESCRIPTIONS.SHORT,
  })
  @Property({ required: true })
  public short!: string;

  @Field({
    description: GAME_DESCRIPTIONS.LOGO,
    nullable: true,
  })
  @Property()
  public logo?: string;

  @Field({
    description: GAME_DESCRIPTIONS.BG,
    nullable: true,
  })
  @Property()
  public bg?: string;

  @Property({ type: mongoose.Schema.Types.Mixed })
  public meta?: any;
}

export const GameModel = getModelForClass(Game, {
  options: {
    customName: 'Game',
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    collection: 'game',
  },
});
