import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { Game } from '@models/game';
import { Player } from '@models/player';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum GAME_ELO_DESCRIPTIONS {
  DESCRIPTIONS = 'Elo ranking for a payer for a given game',
  ID = 'Unique identifier for a game elo document',
  GAME = 'Game that this elo rating ranks',
  PLAYER = 'Player that this elo rating ranks',
  SCORE = 'Elo rating for a player for a given game',
  GAME_IDS = 'List of unique identifiers (_id) of one or more games',
  PLAYER_IDS = 'List of unique identifiers (_id) of one or more players',
  FIND_ONE = 'Find and get an elo raking based on a given game and player',
  FIND = 'Find and get elo rankings based on query parameters',
}

@ObjectType({
  description: GAME_ELO_DESCRIPTIONS.DESCRIPTIONS,
})
@Index({ game: 1, player: 1 })
@Index({ game: 1 })
@Index({ player: 1 })
export class GameElo {
  @Field({
    description: GAME_ELO_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Game, {
    description: GAME_ELO_DESCRIPTIONS.GAME,
  })
  @Property({
    required: true,
    ref: () => Game,
  })
  public game!: Ref<Game>;

  @Field(() => Player, {
    description: GAME_ELO_DESCRIPTIONS.PLAYER,
  })
  @Property({
    required: true,
    ref: () => Player,
  })
  public player!: Ref<Player>;

  @Field({
    description: GAME_ELO_DESCRIPTIONS.SCORE,
  })
  @Property({ required: true })
  public score!: number;
}

export const GameEloModel = getModelForClass(GameElo, {
  options: {
    customName: 'GameElo',
  },
  schemaOptions: {
    collection: 'game_elo',
  },
});
