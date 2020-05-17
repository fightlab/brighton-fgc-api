import { default as mongoose, Document, Schema } from 'mongoose';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';

export interface IResult {
  tournament: Tournament['_id'];
  players: Array<Player['_id']>;
  rank: number;
}

export interface Result extends IResult, Document {}

const ResultSchema: Schema = new Schema({
  tournament: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  players: {
    type: [Schema.Types.ObjectId],
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
