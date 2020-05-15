import { default as mongoose, Document, Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';

export interface Match extends Document {
  tournament: Tournament['_id'];
  players?: Array<Player['_id']>;
  scores?: Array<number>;
  winner?: Player['_id'];
  round?: number;
  round_name?: string;
}

const MatchSchema: Schema = new Schema({
  tournament: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  players: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: 'Player',
    default: [],
  },
  scores: {
    type: [Number],
    required: false,
    default: [],
  },
  winner: {
    type: Schema.Types.ObjectId,
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
