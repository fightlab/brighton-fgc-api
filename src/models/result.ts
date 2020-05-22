import { default as mongoose, Document, Schema } from 'mongoose';
import { isNumber } from 'lodash';
import { Tournament } from '@models/tournament';
import { Player } from '@models/player';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export interface IResult {
  tournament: Tournament['_id'];
  players: Array<Player['_id']>;
  rank: number;
}

export interface Result extends IResult, Document {
  _tournament?: Tournament;
  _players?: Array<Player>;
}

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
    validate: {
      message: generateValidationMessage(
        'rank',
        VALIDATION_MESSAGES.RESULT_RANK_VALIDATION_ERROR,
      ),
      validator: (v: any) => isNumber(v) && v >= 0,
    },
  },
});

ResultSchema.virtual('_tournament', {
  ref: 'Tournament',
  localField: 'tournament',
  foreignField: '_id',
  justOne: true,
});

ResultSchema.virtual('_players', {
  ref: 'Player',
  localField: 'players',
  foreignField: '_id',
});

export const Result = mongoose.model<Result>('Result', ResultSchema, 'result');
