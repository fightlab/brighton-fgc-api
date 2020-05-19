import { default as mongoose, Document, Schema } from 'mongoose';
import { Match } from '@models/match';
import { Player } from '@models/player';

export interface IMatchElo {
  match: Match['_id'];
  player: Player['_id'];
  before: number;
  after: number;
}

export interface MatchElo extends IMatchElo, Document {
  _match?: Match;
  _player?: Player;
}

const MatchEloSchema: Schema = new Schema({
  match: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Match',
  },
  player: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player',
  },
  before: {
    type: Number,
    required: true,
  },
  after: {
    type: Number,
    required: true,
  },
});

MatchEloSchema.virtual('_match', {
  ref: 'Match',
  localField: 'match',
  foreignField: '_id',
  justOne: true,
});

MatchEloSchema.virtual('_player', {
  ref: 'Player',
  localField: 'player',
  foreignField: '_id',
  justOne: true,
});

export const MatchElo = mongoose.model<MatchElo>(
  'MatchElo',
  MatchEloSchema,
  'match_elo',
);
