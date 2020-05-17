import { default as mongoose, Document, Schema } from 'mongoose';

export interface IGame {
  name: string;
  short: string;
  logo?: string;
  bg?: string;
  meta?: any;
}

export interface Game extends IGame, Document {}

const GameSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: false,
  },
  bg: {
    type: String,
    required: false,
  },
  meta: {
    type: Schema.Types.Mixed,
    required: false,
  },
});

export const Game = mongoose.model<Game>('Game', GameSchema, 'game');
