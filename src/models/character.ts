import { default as mongoose, Document, Schema } from 'mongoose';
import { Game } from '@models/game';

export interface ICharacter {
  game: Game['_id'];
  name: string;
  short: string;
  image?: string;
}

export interface Character extends ICharacter, Document {
  _game?: Game;
}

const CharacterSchema: Schema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
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

CharacterSchema.virtual('_game', {
  ref: 'Game',
  localField: 'game',
  foreignField: '_id',
  justOne: true,
});

export const Character = mongoose.model<Character>(
  'Character',
  CharacterSchema,
  'character',
);
