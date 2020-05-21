import { default as mongoose, Document, Schema } from 'mongoose';
import { default as validator } from 'validator';
import { VALIDATION_MESSAGES, generateValidationMessage } from '@lib/messages';
import { Event } from '@models/event';

export interface IEventSocial {
  event: Event['_id'];
  facebook?: string;
  web?: string;
  twitter?: string;
  discord?: string;
  instagram?: string;
  meta?: any;
  twitch?: string;
  youtube?: string;
}

export interface EventSocial extends IEventSocial, Document {
  _event?: Event;
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
    validate: {
      validator: (v: any) => validator.isURL(v),
      message: generateValidationMessage(
        'web',
        VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
      ),
    },
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
  twitch: {
    type: String,
    required: false,
  },
  youtube: {
    type: String,
    required: false,
  },
  meta: {
    type: Schema.Types.Mixed,
    required: false,
  },
});

EventSocialSchema.virtual('_event', {
  ref: 'Event',
  localField: 'event',
  foreignField: '_id',
  justOne: true,
});

export const EventSocial = mongoose.model<EventSocial>(
  'EventSocial',
  EventSocialSchema,
  'event_social',
);
