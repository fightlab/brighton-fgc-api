import { default as mongoose, Document, Schema } from 'mongoose';
import { Event } from '@models/event';

export interface EventSocial extends Document {
  event: Event['_id'];
  facebook?: string;
  web?: string;
  twitter?: string;
  discord?: string;
  instagram?: string;
  misc?: string;
  twitch?: string;
  youtube?: string;
}

const EventSocialSchema: Schema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  facebook: {
    type: String,
    required: false,
  },
  web: {
    type: String,
    required: false,
  },
  twitter: {
    type: String,
    required: false,
  },
  discord: {
    type: String,
    required: false,
  },
  instagram: {
    type: String,
    required: false,
  },
  misc: {
    type: String,
    required: false,
  },
  twitch: {
    type: String,
    required: false,
  },
  youtube: {
    type: String,
    required: false,
  },
});

export const EventSocial = mongoose.model<EventSocial>(
  'EventSocial',
  EventSocialSchema,
  'event_social',
);
