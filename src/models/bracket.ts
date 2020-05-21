import { default as mongoose, Document, Schema } from 'mongoose';
import { default as validator } from 'validator';
import { VALIDATION_MESSAGES, generateValidationMessage } from '@lib/messages';
import { BracketPlatform } from '@models/bracket_platform';
import { Tournament } from '@models/tournament';

export interface IBracket {
  tournament: Tournament['_id'];
  platform: BracketPlatform['_id'];
  platform_id: string;
  url?: string;
  slug?: string;
  image?: string;
}

export interface Bracket extends IBracket, Document {
  _platform?: BracketPlatform;
  _tournament?: Tournament;
}

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
    required: false,
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  },
  slug: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
});

BracketSchema.virtual('_platform', {
  ref: 'BracketPlatform',
  localField: 'platform',
  foreignField: '_id',
  justOne: true,
});

BracketSchema.virtual('_tournament', {
  ref: 'Tournament',
  localField: 'tournament',
  foreignField: '_id',
  justOne: true,
});

export const Bracket = mongoose.model<Bracket>(
  'Bracket',
  BracketSchema,
  'bracket',
);
