import { default as mongoose, Document, Schema } from 'mongoose';
import { isDate } from 'moment';
import { Venue } from '@models/venue';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export interface IEvent {
  name: string;
  date_start: Date;
  date_end: Date;
  venue: Venue['_id'];
  short?: string;
  info?: string;
}

export interface Event extends IEvent, Document {
  _venue?: Venue;
}

const EventSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date_start: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: Event) {
        if (!isDate(this.date_start)) {
          return false;
        }

        if (
          !isDate(this.date_end) ||
          this.date_end.getTime() < this.date_start.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: generateValidationMessage(
        'date_start',
        VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
      ),
    },
  },
  date_end: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: Event) {
        if (!isDate(this.date_end)) {
          return false;
        }

        if (
          !isDate(this.date_start) ||
          this.date_start.getTime() > this.date_end.getTime()
        ) {
          return false;
        }
        return true;
      },
      message: generateValidationMessage(
        'date_end',
        VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
      ),
    },
  },
  short: {
    type: String,
    required: false,
  },
  info: {
    type: String,
    required: false,
  },
  venue: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Venue',
  },
});

EventSchema.virtual('_venue', {
  ref: 'Venue',
  localField: 'venue',
  foreignField: '_id',
  justOne: true,
});

export const Event = mongoose.model<Event>('Event', EventSchema, 'event');
