import { default as mongoose, Document, Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';

export interface IMatch {
  tournament: Tournament['_id'];
  players: Array<Player['_id']>;
  scores: Array<number>;
  winner?: Player['_id'];
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
  players: {
    type: [mongoose.Types.ObjectId],
    required: true,
    ref: 'Player',
    default: [],
  },
  scores: {
    type: [Number],
    required: true,
    default: [],
  },
  winner: {
    type: mongoose.Types.ObjectId,
    required: false,
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
