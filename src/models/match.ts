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
}

export interface Match extends IMatch, Document {}

const MatchSchema: Schema = new Schema({
  tournament: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  player1: {
    type: [mongoose.Types.ObjectId],
    required: false,
    ref: 'Player',
  },
  player2: {
    type: [mongoose.Types.ObjectId],
    required: false,
    ref: 'Player',
  },
  score1: {
    type: Number,
    required: false,
    default: 0,
  },
  score2: {
    type: Number,
    required: false,
    default: 0,
  },
  winner: {
    type: [mongoose.Types.ObjectId],
    required: false,
    ref: 'Player',
  },
  loser: {
    type: [mongoose.Types.ObjectId],
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
});

export const Match = mongoose.model<Match>('Match', MatchSchema, 'match');
