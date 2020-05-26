import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { Game } from '@models/game';
import { Field, ObjectType } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum CHARACTER_DESCRIPTIONS {
  DESCRIPTIONS = 'Characters that have appeared in game VODs',
  ID = 'Unique identifier of the character',
  IDS = 'List of unique identifiers (_id) of multiple characters',
  NAME = 'Name of the Character',
  GAME = 'Game in which the character appears',
  GAME_ID = '_id of the game in which the character appears',
  SHORT = 'Shorthand name of the character',
  IMAGE = 'Image of the character',
  FIND_ONE = 'Find and get a single character by id',
  FIND = 'Find and get all characters',
}

@ObjectType({
  description: CHARACTER_DESCRIPTIONS.DESCRIPTIONS,
})
@Index({ name: 1 })
@Index({ short: 1 })
@Index({ game: 1 })
export class Character {
  // only in graphql
  @Field({
    description: CHARACTER_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Game, {
    description: CHARACTER_DESCRIPTIONS.GAME,
  })
  @Property({
    required: true,
    ref: () => Game,
  })
  public game!: Ref<Game>;

  @Field({
    description: CHARACTER_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  public name!: string;

  @Field({
    description: CHARACTER_DESCRIPTIONS.SHORT,
  })
  @Property({ required: true })
  public short!: string;

  @Field({
    description: CHARACTER_DESCRIPTIONS.IMAGE,
    nullable: true,
  })
  @Property()
  public image?: string;
}

export const CharacterModel = getModelForClass(Character, {
  options: {
    customName: 'Character',
  },
  schemaOptions: {
    collection: 'character',
  },
});
