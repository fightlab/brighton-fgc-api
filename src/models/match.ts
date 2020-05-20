import { default as mongoose, Document, Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';

export interface IMatch {
  tournament: Tournament['_id'];
  player1?: Array<Player['_id']>;
  player2?: Array<Player['_id']>;
  score1?: number;
  score2?: number;
  winner?: Array<Player['_id']>;
  loser?: Array<Player['_id']>;
  round?: number;
  round_name?: string;
  meta?: any;
}

export interface Match extends IMatch, Document {
  _tournament?: Tournament;
  _player1?: Array<Player>;
  _player2?: Array<Player>;
  _winner?: Array<Player>;
  _loser?: Array<Player>;
}

const MatchSchema: Schema = new Schema({
  tournament: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  player1: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: 'Player',
  },
  player2: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: 'Player',
  },
  score1: {
    type: Number,
    required: false,
  },
  score2: {
    type: Number,
    required: false,
  },
  winner: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: 'Player',
  },
  loser: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: 'Player',
  },
  round: {
    type: Number,
    required: false,
  },
  round_name: {
    type: String,
    required: false,
  },
  meta: {
    type: Schema.Types.Mixed,
    required: false,
  },
});

MatchSchema.virtual('_tournament', {
  ref: 'Tournament',
  localField: 'tournament',
  foreignField: '_id',
  justOne: true,
});

MatchSchema.virtual('_player1', {
  ref: 'Player',
  localField: 'player1',
  foreignField: '_id',
});

MatchSchema.virtual('_player2', {
  ref: 'Player',
  localField: 'player2',
  foreignField: '_id',
});

MatchSchema.virtual('_winner', {
  ref: 'Player',
  localField: 'winner',
  foreignField: '_id',
});

MatchSchema.virtual('_loser', {
  ref: 'Player',
  localField: 'loser',
  foreignField: '_id',
});

export const Match = mongoose.model<Match>('Match', MatchSchema, 'match');
