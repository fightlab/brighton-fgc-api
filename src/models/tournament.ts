import { default as mongoose, Document, Schema } from 'mongoose';
import { Event } from '@models/event';
import { Game } from '@models/game';
import { Player } from '@models/player';

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
}

export interface Tournament extends ITournament, Document {}

const TournamentSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date_start: {
    type: Date,
    required: true,
  },
  date_end: {
    type: Date,
    required: false,
  },
  type: {
    type: Number,
    required: true,
  },
  event: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  games: {
    type: [mongoose.Types.ObjectId],
    required: true,
    ref: 'Game',
  },
  players: {
    type: [mongoose.Types.ObjectId],
    required: false,
    ref: 'Player',
    default: [],
  },
});

export const Tournament = mongoose.model<Tournament>(
  'Tournament',
  TournamentSchema,
  'tournament',
);
