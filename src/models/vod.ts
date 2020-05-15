import { default as mongoose, Document, Schema } from 'mongoose';
import { VodPlatform } from '@models/vod_platform';

export interface Vod extends Document {
  platform: VodPlatform['_id'];
  platform_id: string;
  url: string;
  start_time?: string;
}

const VodSchema: Schema = new Schema({
  platform: {
    type: mongoose.ObjectId,
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
  },
  start_time: {
    type: String,
    required: false,
    default: '0',
  },
});

export const Vod = mongoose.model<Vod>('Vod', VodSchema, 'vod');
