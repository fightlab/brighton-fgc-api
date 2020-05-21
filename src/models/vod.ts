import { default as mongoose, Document, Schema } from 'mongoose';
import { VodPlatform } from '@models/vod_platform';
import { Tournament } from '@models/tournament';
import validator from 'validator';
import {
  generateValidationMessage,
  VALIDATION_MESSAGES,
} from '@lib/validation';

export interface IVod {
  tournament: Tournament['_id'];
  platform: VodPlatform['_id'];
  platform_id: string;
  url: string;
  start_time?: string;
}

export interface Vod extends IVod, Document {
  _tournament?: Tournament;
  _platform?: VodPlatform;
}

const VodSchema: Schema = new Schema({
  tournament: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Tournament',
  },
  platform: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'VodPlatform',
  },
  platform_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'url',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
  },
  start_time: {
    type: String,
    required: false,
    default: '0',
  },
});

VodSchema.virtual('_tournament', {
  ref: 'Tournament',
  localField: 'tournament',
  foreignField: '_id',
  justOne: true,
});

VodSchema.virtual('_platform', {
  ref: 'VodPlatform',
  localField: 'platform',
  foreignField: '_id',
  justOne: true,
});

export const Vod = mongoose.model<Vod>('Vod', VodSchema, 'vod');
