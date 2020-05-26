import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { Event } from '@models/event';

export class EventSeries {
  @Property({ required: true })
  public name!: string;

  @Property({
    required: true,
    ref: () => Event,
    default: [],
  })
  public events!: Array<Ref<Event>>;

  @Property()
  public info?: string;
}

export const EventSeriesModel = getModelForClass(EventSeries, {
  options: {
    customName: 'EventSeries',
  },
  schemaOptions: {
    collection: 'event_series',
  },
});
