import { default as mongoose, Document, Schema } from 'mongoose';
import { Event } from '@models/event';
import { MESSAGES } from '@lib/messages';

export interface IEventSeries {
  name: string;
  events: Array<Event['_id']>;
  info?: string;
}

export interface EventSeries extends IEventSeries, Document {
  _events?: Array<Event>;
}

const EventSeriesSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  events: {
    type: [Schema.Types.ObjectId],
    validate: {
      validator: (v: any) => v == null || v.length > 0,
      message: MESSAGES.MODEL_EVENT_SERIES_EVENT_VALIDATION_ERROR,
    },
    ref: 'Event',
  },
  info: {
    type: String,
    required: false,
  },
});

EventSeriesSchema.virtual('_events', {
  ref: 'Event',
  localField: 'events',
  foreignField: '_id',
});

export const EventSeries = mongoose.model<EventSeries>(
  'EventSeries',
  EventSeriesSchema,
  'event_series',
);
