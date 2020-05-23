import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { EventClass } from '@models/event';

export class EventSeriesClass {
  @Property({ required: true })
  public name!: string;

  @Property({
    required: true,
    ref: () => EventClass,
    default: [],
  })
  public events!: Array<Ref<EventClass>>;

  @Property()
  public info?: string;
}

export const EventSeries = getModelForClass(EventSeriesClass, {
  options: {
    customName: 'EventSeries',
  },
  schemaOptions: {
    collection: 'event_series',
  },
});
