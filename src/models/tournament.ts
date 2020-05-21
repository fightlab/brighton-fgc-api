import { default as mongoose, Document, Schema } from 'mongoose';
import { isDate } from 'moment';
import { Event } from '@models/event';
import { Game } from '@models/game';
import { Player } from '@models/player';
import { MESSAGES } from '@lib/messages';

export enum TOURNAMENT_TYPE {
  DOUBLE_ELIMINATION,
  SINGLE_ELIMINATION,
  ROUND_ROBIN,
}

export interface ITournament {
  name: string;
  date_start: Date;
  date_end?: Date;
  type: number;
  event: Event['_id'];
  games: Array<Game['_id']>;
  players?: Array<Player['_id']>;
  is_team_based?: boolean;
}

export interface Tournament extends ITournament, Document {
  _event?: Event;
  _games?: Array<Game>;
  _players?: Array<Player>;
}

const TournamentSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date_start: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: Event) {
        if (!isDate(this.date_start)) {
          return false;
        }

        // since date end can be undefined, check for existence and then check if not valid
        if (
          isDate(this.date_end) &&
          this.date_end.getTime() < this.date_start.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: MESSAGES.DATE_START_VALIDATION_ERROR,
    },
  },
  date_end: {
    type: Date,
    required: false,
    validate: {
      validator: function (this: Event) {
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
      message: MESSAGES.DATE_END_VALIDATION_ERROR,
    },
  },
  type: {
    type: Number,
    required: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  games: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Game',
  },
  players: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: 'Player',
    default: [],
  },
  is_team_based: {
    type: Boolean,
    required: false,
    default: false,
  },
});

TournamentSchema.virtual('_event', {
  ref: 'Event',
  localField: 'event',
  foreignField: '_id',
  justOne: true,
});

TournamentSchema.virtual('_games', {
  ref: 'Game',
  localField: 'games',
  foreignField: '_id',
});

TournamentSchema.virtual('_players', {
  ref: 'Player',
  localField: 'players',
  foreignField: '_id',
});

export const Tournament = mongoose.model<Tournament>(
  'Tournament',
  TournamentSchema,
  'tournament',
);
