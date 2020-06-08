import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { Match } from '@models/match';
import { Player } from '@models/player';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum MATCH_ELO_DESCRIPTIONS {
  DESCRIPTION = 'Elo ranking for a player before and after a given match',
  ID = 'Unique identifier for a match elo document',
  MATCH_ID = 'Unique identifier (_id) of the match that this match elo rating belongs to',
  MATCH_IDS = 'Unique identifiers (_id) of matches that have match elo ratings belongs to',
  MATCH = 'Match that this match elo rating belongs to',
  PLAYER = 'Player that this match elo rating ranks',
  PLAYER_ID = 'Unique identifier (_id) of the player that this match elo rating ranks',
  PLAYER_IDS = 'Unique identifiers (_id) of players that have match elo ratings belongs to',
  BEFORE = 'The elo rating for a player before the start of a match',
  AFTER = 'The elo rating for a player after the end of a match',
  FIND_ONE = 'Find and get a match elo ranking based on a given match and player',
  FIND = 'Find and get match elo rankings based on query parameters',
}

@ObjectType({
  description: MATCH_ELO_DESCRIPTIONS.DESCRIPTION,
})
@Index({ match: 1, player: 1 })
@Index({ match: 1 })
@Index({ player: 1 })
export class MatchElo {
  @Field({
    description: MATCH_ELO_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Match, {
    description: MATCH_ELO_DESCRIPTIONS.MATCH,
  })
  @Property({
    required: true,
    ref: () => Match,
  })
  public match!: Ref<Match>;

  @Field(() => Player, {
    description: MATCH_ELO_DESCRIPTIONS.PLAYER,
  })
  @Property({
    required: true,
    ref: () => Player,
  })
  public player!: Ref<Player>;

  @Field({
    description: MATCH_ELO_DESCRIPTIONS.BEFORE,
  })
  @Property({ required: true })
  public before!: number;

  @Field({
    description: MATCH_ELO_DESCRIPTIONS.AFTER,
  })
  @Property({ required: true })
  public after!: number;
}

export const MatchEloModel = getModelForClass(MatchElo, {
  options: {
    customName: 'MatchElo',
  },
  schemaOptions: {
    collection: 'match_elo',
  },
});
