import { default as mongoose, Document, Schema } from 'mongoose';
import { BracketPlatform } from '@models/bracket_platform';
import { Tournament } from '@models/tournament';

export interface IBracket {
  tournament: Tournament['_id'];
  platform: BracketPlatform['_id'];
  platform_id: string;
  url: string;
  slug: string;
  image?: string;
}

export interface Bracket extends IBracket, Document {}

const BracketSchema: Schema = new Schema({
  tournament: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
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
