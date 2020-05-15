import { default as mongoose, Document, Schema } from 'mongoose';
import { BracketPlatform } from '@models/bracket_platform';

export interface Bracket extends Document {
  platform: BracketPlatform['_id'];
  platform_id: string;
  url: string;
  slug: string;
  image?: string;
}

const BracketSchema: Schema = new Schema({
  platform: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'BracketPlatform',
  },
  platform_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
});

export const Bracket = mongoose.model<Bracket>(
  'Bracket',
  BracketSchema,
  'bracket',
);
