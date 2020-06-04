import {
  prop as Property,
  getModelForClass,
  Ref,
  Index,
} from '@typegoose/typegoose';
import { isDate } from 'moment';
import { Event } from '@models/event';
import { Game } from '@models/game';
import { Player } from '@models/player';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';
import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum TOURNAMENT_TYPE {
  DOUBLE_ELIMINATION,
  SINGLE_ELIMINATION,
  ROUND_ROBIN,
}

export enum TOURNAMENT_DESCRIPTIONS {
  DESCRIPTION = 'Information about tournaments',
  ID = 'Unique identifier of the tournament',
  IDS = 'List of unique identifiers (_id) of one or more tournaments',
  NAME = 'Name of the tournament',
  DATE_START = 'Date and time that the tournament started',
  DATE_END = 'Date and time that the tournament finished',
  GAMES = 'List of games that were a part of this tournament',
  EVENT = 'Event that this tournament took place',
  PLAYERS = 'List of players that took part in this tournament',
  IS_TEAM_BASED = 'Determines if this is a team based tournament',
  TYPE = 'Tournament type, e.g. single elimination, double elimination etc.',
  FIND_ONE = 'Find and get a single tournament by id',
  FIND = 'Find and get some or all tournaments',
}

@ObjectType({
  description: TOURNAMENT_DESCRIPTIONS.DESCRIPTION,
})
@Index({ name: 1 })
@Index({ date_start: -1 })
@Index({ date_end: -1 })
@Index({ date_start: -1, date_end: -1 })
@Index({ date_start: 1, date_end: 1 })
@Index({ event: 1 })
@Index({ games: 1 })
@Index({ players: 1 })
@Index({ is_team_based: 1 })
@Index({ is_team_based: 1 })
export class Tournament {
  //only in graphql
  @Field({
    description: TOURNAMENT_DESCRIPTIONS.ID,
  })
  readonly _id?: ObjectId;

  @Field({
    description: TOURNAMENT_DESCRIPTIONS.NAME,
  })
  @Property({ required: true })
  name!: string;

  @Field({
    description: TOURNAMENT_DESCRIPTIONS.DATE_START,
  })
  @Property({
    required: true,
    validate: {
      validator: function (this: Tournament) {
        // since date end can be undefined, check for existence and then check if not valid
        if (
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
  date_start!: Date;

  @Field({
    description: TOURNAMENT_DESCRIPTIONS.DATE_END,
    nullable: true,
  })
  @Property({
    validate: {
      validator: function (this: Tournament) {
        // undefined is a valid end date
        if (this.date_end === undefined) {
          return true;
        }

        if (!isDate(this.date_end)) {
          return false;
        }

        if (
          !isDate(this.date_start) ||
          this.date_start.getTime() > this.date_end.getTime()
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

  @Field({
    description: TOURNAMENT_DESCRIPTIONS.TYPE,
  })
  @Property({
    required: true,
    enum: TOURNAMENT_TYPE,
    type: Number,
  })
  type!: TOURNAMENT_TYPE;

  @Field(() => Event, {
    description: TOURNAMENT_DESCRIPTIONS.EVENT,
  })
  @Property({
    required: true,
    ref: () => Event,
  })
  event!: Ref<Event>;

  @Field(() => [Game], {
    description: TOURNAMENT_DESCRIPTIONS.GAMES,
  })
  @Property({
    required: true,
    ref: () => Game,
    default: [],
  })
  games!: Array<Ref<Game>>;

  @Field(() => [Player], {
    description: TOURNAMENT_DESCRIPTIONS.PLAYERS,
  })
  @Property({
    required: true,
    ref: () => Player,
    default: [],
  })
  players!: Array<Ref<Player>>;

  @Field({
    description: TOURNAMENT_DESCRIPTIONS.IS_TEAM_BASED,
    nullable: true,
  })
  @Property()
  is_team_based?: boolean;
}

export const TournamentModel = getModelForClass(Tournament, {
  options: {
    customName: 'Tournament',
  },
  schemaOptions: {
    collection: 'tournament',
  },
});
