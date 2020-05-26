import {
  prop as Property,
  getModelForClass,
  Index,
} from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum PLAYER_DESCRIPTIONS {
  DESCRIPTIONS = 'Players that have taken part in a tournament',
  ID = 'Unique identifier of a player',
  IDS = 'List of unique identifiers (_id) of multiple players',
  HANDLE = 'The handle/username of the player',
  ICON = `URL of the player's avatar/icon`,
  TEAM = 'The team abbreviation that the player belongs to',
  IS_STAFF = 'Boolean that determines if a player is a member of staff',
  FIND_ONE = 'Find and get a single player by id',
  FIND = 'Find and get some or all players',
}

@ObjectType({
  description: PLAYER_DESCRIPTIONS.DESCRIPTIONS,
})
@Index({ handle: 1 })
export class Player {
  @Field({
    description: PLAYER_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: PLAYER_DESCRIPTIONS.HANDLE,
  })
  @Property({ required: true })
  public handle!: string;

  @Field({
    description: PLAYER_DESCRIPTIONS.ICON,
    nullable: true,
  })
  @Property()
  public icon?: string;

  @Field({
    description: PLAYER_DESCRIPTIONS.TEAM,
    nullable: true,
  })
  @Property()
  public team?: string;

  @Field({
    description: PLAYER_DESCRIPTIONS.IS_STAFF,
    nullable: true,
  })
  @Property({ default: false })
  public is_staff?: boolean;
}

export const PlayerModel = getModelForClass(Player, {
  options: {
    customName: 'Player',
  },
  schemaOptions: {
    collection: 'player',
  },
});
