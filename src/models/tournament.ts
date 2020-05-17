import { default as mongoose, Document, Schema } from 'mongoose';
import { Event } from '@models/event';
import { Game } from '@models/game';
import { Player } from '@models/player';
import { Bracket } from '@models/bracket';
import { Vod } from '@models/vod';

export interface ITournament {
  name: string;
  date_start: Date;
  date_end?: Date;
  type: string;
  event: Event['_id'];
  games: Array<Game['_id']>;
  bracket: Bracket['_id'];
  players?: Array<Player['_id']>;
  vod?: Array<Vod['_id']>;
  include_in_ranking?: boolean;
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
    type: String,
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
  bracket: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Bracket',
  },
  vod: {
    type: [mongoose.Types.ObjectId],
    required: false,
    ref: 'Vod',
    default: [],
  },
  include_in_ranking: {
    type: Boolean,
    required: false,
    default: true,
  },
});

export const Tournament = mongoose.model<Tournament>(
  'Tournament',
  TournamentSchema,
  'tournament',
);
