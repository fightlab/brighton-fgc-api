import { default as moment } from 'moment';
import { chunk } from 'lodash';
import { DocumentType, isDocumentArray } from '@typegoose/typegoose';
import { EventSeries, EventSeriesClass } from '@models/event_series';
import { Event, EventClass } from '@models/event';
import { Types } from 'mongoose';

describe('EventSeries model test', () => {
  let events: Array<DocumentType<EventClass>>;
  let eventSeriesFull: EventSeriesClass;
  let eventSeriesMin: EventSeriesClass;
  let eventSeries: DocumentType<EventSeriesClass>;

  beforeEach(async () => {
    // fake some events
    events = await Event.create([
      {
        name: 'Event #1',
        venue: new Types.ObjectId(),
        date_end: moment.utc().subtract(1, 'd').toDate(),
        date_start: moment.utc().subtract(1, 'd').subtract(1, 'h').toDate(),
      },
      {
        name: 'Event #2',
        venue: new Types.ObjectId(),
        date_end: moment.utc().subtract(2, 'd').toDate(),
        date_start: moment.utc().subtract(2, 'd').subtract(2, 'h').toDate(),
      },
      {
        name: 'Event #3',
        venue: new Types.ObjectId(),
        date_end: moment.utc().subtract(3, 'd').toDate(),
        date_start: moment.utc().subtract(3, 'd').subtract(3, 'h').toDate(),
      },
      {
        name: 'Event #4',
        venue: new Types.ObjectId(),
        date_end: moment.utc().subtract(4, 'd').toDate(),
        date_start: moment.utc().subtract(4, 'd').subtract(4, 'h').toDate(),
      },
    ] as Array<EventClass>);

    eventSeriesFull = {
      name: 'Event Series Full',
      events: chunk(events, 2)[0].map((e) => e._id),
      info: 'This is an full event series with 2 events',
    };

    eventSeriesMin = {
      name: 'Event Series Min',
      events: chunk(events, 2)[1].map((e) => e._id),
    };

    [eventSeries] = await EventSeries.create([
      {
        name: 'Event Series',
        events: events.map((e) => e._id),
      },
    ] as Array<EventSeriesClass>);
  });

  it('should create & save eventSeries successfully', async () => {
    const input = new EventSeries(eventSeriesFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(eventSeriesFull.name);
    expect(output.events.length).toBe(eventSeriesFull.events.length);
    expect(output.events[0]?.toString()).toBe(
      eventSeriesFull.events[0]?.toString(),
    );
    expect(output.info).toBe(eventSeriesFull.info);
  });

  it('should create & save min eventSeries successfully', async () => {
    const input = new EventSeries(eventSeriesMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(eventSeriesMin.name);
    expect(output.events.length).toBe(eventSeriesMin.events.length);
    expect(output.events[0]?.toString()).toBe(
      eventSeriesMin.events[0]?.toString(),
    );
    expect(output.info).toBeUndefined();
  });

  it('should populate events', async () => {
    const output = await EventSeries.findById(eventSeries._id).populate(
      'events',
    );
    expect(output).toBeDefined();
    if (output) {
      expect(isDocumentArray(output.events)).toBe(true);
      if (isDocumentArray(output.events)) {
        expect(output?.events).toHaveLength(4);
        expect(output?.events[0].id).toBe(events[0].id);
      }
    }
  });
});
