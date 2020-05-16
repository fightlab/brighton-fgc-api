import { default as mongoose, Document, Schema } from 'mongoose';
import { Match } from '@models/match';
import { Player } from '@models/player';

export interface IMatchElo {
  match: Match['_id'];
  player: Player['_id'];
  before: number;
  after: number;
}

export interface MatchElo extends IMatchElo, Document {}

const MatchEloSchema: Schema = new Schema({
  match: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Match',
  },
  player: {
    type: mongoose.Types.ObjectId,
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

export const MatchElo = mongoose.model<MatchElo>(
  'MatchElo',
  MatchEloSchema,
  'match_elo',
);
