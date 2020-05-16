import { default as mongoose, Document, Schema } from 'mongoose';

export interface IVodPlatform {
  name: string;
  url: string;
  watch_url?: string;
  embed_url?: string;
}

export interface VodPlatform extends IVodPlatform, Document {}

const VodPlatformSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  watch_url: {
    type: String,
    required: false,
  },
  embed_url: {
    type: String,
    required: false,
  },
});

export const VodPlatform = mongoose.model<VodPlatform>(
  'VodPlatform',
  VodPlatformSchema,
  'vod_platform',
);
