import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { isDate } from 'moment';
import { VenueClass } from '@models/venue';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

export class EventClass {
  @Property({ required: true })
  public name!: string;

  @Property({
    required: true,
    validate: {
      validator: function (this: EventClass) {
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
  })
  public date_start!: Date;

  @Property({
    required: true,
    validate: {
      validator: function (this: EventClass) {
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
  })
  public date_end!: Date;

  @Property({
    required: true,
    ref: () => VenueClass,
  })
  public venue!: Ref<VenueClass>;

  @Property()
  public short?: string;

  @Property()
  public info?: string;
}

export const Event = getModelForClass(EventClass, {
  options: {
    customName: 'Event',
  },
  schemaOptions: {
    collection: 'event',
  },
});
