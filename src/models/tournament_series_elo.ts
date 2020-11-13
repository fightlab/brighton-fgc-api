import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { TournamentSeries } from '@models/tournament_series';
import { Player } from '@models/player';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum TOURNAMENT_SERIES_ELO_DESCRIPTIONS {
  DESCRIPTION = 'Elo ranking for a player at a given tournament series',
  ID = 'Unique identifier for a tournament series elo document',
  IDS = 'Unique identifiers (_id) of one or more tournament series elo documents',
  TOURNAMENT_SERIES = 'Tournament series that this elo rating ranks',
  TOURNAMENT_SERIES_ID = 'Unique identifier of a tournament series that this elo rating ranks',
  TOURNAMENT_SERIES_IDS = 'List of unique identifiers (_id) of one or more tournament series',
  PLAYER = 'Player that this elo rating ranks',
  PLAYER_ID = 'Unique identifier (_id) of a player',
  PLAYER_IDS = 'List of unique identifiers (_id) of one or more players',
  SCORE = 'Elo rating for a player for a given tournament series',
  FIND_ONE = 'Find and get an elo raking based on a given tournament series and player',
  FIND = 'Find and get elo rankings based on query parameters',
  SCORE_MIN = 'Minimum score to search for',
  SCORE_MAX = 'Maximum score to search for',
}

@ObjectType({ description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.DESCRIPTION })
@Index({ tournament_series: 1, player: 1, score: 1 })
@Index({ tournament_series: 1, player: 1 })
@Index({ score: 1 })
@Index({ player: 1 })
@Index({ tournament_series: 1 })
export class TournamentSeriesElo {
  @Field({
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => TournamentSeries, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.TOURNAMENT_SERIES,
  })
  @Property({
    required: true,
    ref: () => TournamentSeries,
  })
  public tournament_series!: Ref<TournamentSeries>;

  @Field(() => Player, {
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.PLAYER,
  })
  @Property({
    required: true,
    ref: () => Player,
  })
  public player!: Ref<Player>;

  @Field({
    description: TOURNAMENT_SERIES_ELO_DESCRIPTIONS.SCORE,
  })
  @Property({ required: true })
  public score!: number;
}

export const TournamentSeriesEloModel = getModelForClass(TournamentSeriesElo, {
  options: {
    customName: 'TournamentSeriesElo',
  },
  schemaOptions: {
    collection: 'tournament_series_elo',
  },
});
