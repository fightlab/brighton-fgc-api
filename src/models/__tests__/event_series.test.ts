import { chunk } from 'lodash';
import { EventSeries, IEventSeries } from '@models/event_series';
import { Event } from '@models/event';
import { MESSAGES } from '@lib/messages';

describe('EventSeries model test', () => {
  let events: Array<Event>;
  let eventSeriesFull: IEventSeries;
  let eventSeriesMin: IEventSeries;

  beforeAll(async () => {
    events = await Event.find().limit(4);

    eventSeriesFull = {
      name: 'Event Series Full',
      events: chunk(events, 2)[0].map((e) => e._id),
      info: 'This is an full event series with 2 events',
    };

    eventSeriesMin = {
      name: 'Event Series Min',
      events: chunk(events, 2)[1].map((e) => e._id),
    };
  });

  it('should create & save eventSeries successfully', async () => {
    const input = new EventSeries(eventSeriesFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(eventSeriesFull.name);
    expect(output.events.length).toBe(eventSeriesFull.events.length);
    expect(output.events[0].toString()).toBe(
      eventSeriesFull.events[0].toString(),
    );
    expect(output.info).toBe(eventSeriesFull.info);

    // shouldn't populate virtuals
    expect(output._events).toBeUndefined();
  });

  it('should create & save min eventSeries successfully', async () => {
    const input = new EventSeries(eventSeriesMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.name).toBe(eventSeriesMin.name);
    expect(output.events.length).toBe(eventSeriesMin.events.length);
    expect(output.events[0].toString()).toBe(
      eventSeriesMin.events[0].toString(),
    );
    expect(output.info).toBeUndefined();

    // shouldn't populate virtuals
    expect(output._events).toBeUndefined();
  });

  it('should fail if trying to save without an event', async () => {
    const input = new EventSeries({
      name: 'Event Series Empty',
      events: [],
    });

    input.validate((error) => {
      expect(error.errors.events.message).toBe(
        MESSAGES.MODEL_EVENT_SERIES_EVENT_VALIDATION_ERROR,
      );
    });
  });

  it('should populate events', async () => {
    const output = await EventSeries.findOne().populate('_events');
    expect(output?._events).toBeDefined();
    expect(output?._events?.length).toBeGreaterThan(0);
  });
});
