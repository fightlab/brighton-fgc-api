import { default as mongoose, Document, Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';

export interface Result extends Document {
  tournament: Tournament['_id'];
  player: Player['_id'];
  rank: number;
}

const ResultSchema: Schema = new Schema({
  tournament: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  player: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Player',
  },
  rank: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const Result = mongoose.model<Result>('Result', ResultSchema, 'result');
