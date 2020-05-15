import { default as mongoose, Document, Schema } from 'mongoose';

export interface Game extends Document {
  name: string;
  short: string;
  logo?: string;
  bg?: string;
  meta?: string;
}

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
    type: String,
    required: false,
  },
});

export const Game = mongoose.model<Game>('Game', GameSchema, 'game');
