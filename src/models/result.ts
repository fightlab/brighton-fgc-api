import { default as mongoose, Document, Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';

export interface IResult {
  tournament: Tournament['_id'];
  player: Player['_id'];
  rank: number;
}

export interface Result extends IResult, Document {}

const ResultSchema: Schema = new Schema({
  tournament: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  player: {
    type: mongoose.Types.ObjectId,
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
