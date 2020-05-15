import { default as mongoose, Document, Schema } from 'mongoose';
import { Game } from '@models/game';

export interface Character extends Document {
  game: Game['_id'];
  name: string;
  short: string;
  image?: string;
}

const CharacterSchema: Schema = new Schema({
  game: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Game',
  },
  name: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
});

export const Character = mongoose.model<Character>(
  'Character',
  CharacterSchema,
  'character',
);
