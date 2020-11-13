import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';
import { isDate } from 'moment';

export enum MATCH_DESCRIPTIONS {
  DESCRIPTION = 'Individual match information from a tournament with players and scores',
  ID = 'Unique identifier for the match',
  IDS = 'List of unique identifiers (_id) or one or more matches',
  TOURNAMENT = 'The tournament that the match belongs to',
  TOURNAMENT_ID = 'The unique identifier (_id) of the tournament of this matches',
  TOURNAMENT_IDS = 'The unique identifiers (_id) of tournaments that has matches',
  PLAYER_1 = 'Player(s) on P1 side',
  PLAYER_1_IDS = 'Unique id(s) of player(s) on P1 side',
  PLAYER_IDS = 'Unique id(s) of player(s)',
  PLAYER_2 = 'Player(s) on P2 side',
  PLAYER_2_IDS = 'Unique id(s) of player(s) on P2 side',
  SCORE_1 = 'Final score for P1',
  SCORE_2 = 'Final score for P2',
  WINNER = 'Player(s) who won the match',
  WINNER_IDS = 'Unique id(s) of players who won the match',
  LOSER = 'Player(s) who lost the match',
  LOSER_IDS = 'Unique id(s) of players who lost the match',
  ROUND = 'Number which identifies the round/stage the match is at, negative for losers bracket (if applicable)',
  ROUND_NAME = 'Name of the round, e.g. "Winners Round 1" or "Losers Final" etc.',
  DATE_START = 'The date time this match was started',
  DATE_END = 'The date time this match finished',
  FIND_ONE = 'Get a single match by id',
  FIND = 'Get a list of matches depending on given query parameters',
}

@ObjectType()
@Index({ date_start: 1 })
@Index({ date_end: 1 })
@Index({ tournament: 1 })
@Index({ player1: 1 })
@Index({ player2: 1 })
@Index({ score1: 1 })
@Index({ score2: 1 })
@Index({ winner: 1 })
@Index({ loser: 1 })
@Index({ round: 1 })
@Index({ round_name: 1 })
export class Match {
  //only in graphql
  @Field({
    description: MATCH_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field(() => Tournament, {
    description: MATCH_DESCRIPTIONS.TOURNAMENT,
  })
  @Property({
    required: true,
    ref: () => Tournament,
  })
  public tournament: Ref<Tournament>;

  @Field(() => [Player], {
    description: MATCH_DESCRIPTIONS.PLAYER_1,
    nullable: true,
  })
  @Property({
    ref: () => Player,
  })
  public player1?: Array<Ref<Player>>;

  @Field(() => [Player], {
    description: MATCH_DESCRIPTIONS.PLAYER_2,
    nullable: true,
  })
  @Property({
    ref: () => Player,
  })
  public player2?: Array<Ref<Player>>;

  @Field({
    description: MATCH_DESCRIPTIONS.SCORE_1,
    nullable: true,
  })
  @Property()
  public score1?: number;

  @Field({
    description: MATCH_DESCRIPTIONS.SCORE_2,
    nullable: true,
  })
  @Property()
  public score2?: number;

  @Field(() => [Player], {
    description: MATCH_DESCRIPTIONS.WINNER,
    nullable: true,
  })
  @Property({
    ref: () => Player,
  })
  public winner?: Array<Ref<Player>>;

  @Field(() => [Player], {
    description: MATCH_DESCRIPTIONS.LOSER,
    nullable: true,
  })
  @Property({
    ref: () => Player,
  })
  public loser?: Array<Ref<Player>>;

  @Field({
    description: MATCH_DESCRIPTIONS.ROUND,
    nullable: true,
  })
  @Property()
  public round?: number;

  @Field({
    description: MATCH_DESCRIPTIONS.ROUND_NAME,
    nullable: true,
  })
  @Property()
  public round_name?: string;

  @Field({
    description: MATCH_DESCRIPTIONS.DATE_START,
    nullable: true,
  })
  @Property({
    validate: {
      validator: function (this: Tournament) {
        // since date end can be undefined, check for existence and then check if not valid
        if (
          this.date_start &&
          this.date_end &&
          isDate(this.date_start) &&
          isDate(this.date_end) &&
          this.date_end.getTime() < this.date_start.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: generateValidationMessage(
        'date_start',
        VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
      ),
    },
  })
  date_start?: Date;

  @Field({
    description: MATCH_DESCRIPTIONS.DATE_END,
    nullable: true,
  })
  @Property({
    validate: {
      validator: function (this: Tournament) {
        if (
          this.date_start &&
          this.date_end &&
          isDate(this.date_start) &&
          isDate(this.date_end) &&
          this.date_end.getTime() < this.date_start.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: generateValidationMessage(
        'date_end',
        VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
      ),
    },
  })
  date_end?: Date;
}

export const MatchModel = getModelForClass(Match, {
  options: {
    customName: 'Match',
  },
  schemaOptions: {
    collection: 'match',
  },
});
