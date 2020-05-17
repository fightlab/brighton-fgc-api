import { default as mongoose, Document, Schema } from 'mongoose';
import { Venue } from '@models/venue';

export interface IEvent {
  name: string;
  date_start: Date;
  date_end: Date;
  venue: Venue['_id'];
  short?: string;
}

export interface Event extends IEvent, Document {}

const EventSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date_start: {
    type: Date,
    required: true,
  },
  date_end: {
    type: Date,
    required: true,
  },
  short: {
    type: String,
    required: false,
  },
  venue: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Venue',
  },
});

export const Event = mongoose.model<Event>('Event', EventSchema, 'event');
