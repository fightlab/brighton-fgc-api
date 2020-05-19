import { default as moment } from 'moment';
import { EventSocial, IEventSocial } from '@models/event_social';
import { Event, IEvent } from '@models/event';
import { Types } from 'mongoose';

describe('EventSocial model test', () => {
  let events: Array<Event>;
  let eventSocialFull: IEventSocial;
  let eventSocialMin: IEventSocial;
  let eventSocial: EventSocial;

  beforeEach(async () => {
    // fake some events
    events = await Event.create([
      {
        name: 'Event 1',
        venue: new Types.ObjectId(),
        date_start: moment.utc().subtract(1, 'd').subtract(1, 'h').toDate(),
        date_end: moment.utc().subtract(1, 'd').toDate(),
      },
      {
        name: 'Event 2',
        venue: new Types.ObjectId(),
        date_start: moment.utc().subtract(2, 'd').subtract(2, 'h').toDate(),
        date_end: moment.utc().subtract(2, 'd').toDate(),
      },
    ] as Array<IEvent>);

    eventSocialFull = {
      event: events[0]._id,
      facebook: 'event social facebook',
      twitch: 'event social twitch',
      discord: 'event social discord',
      instagram: 'event social instagram',
      twitter: 'event social twitter',
      web: 'event social web',
      youtube: 'event social youtube',
      meta: {
        hello: 'world',
      },
    };

    // not sure why you'd do this but /shrug
    eventSocialMin = {
      event: events[1]._id,
    };

    // add an event social to the collection
    [eventSocial] = await EventSocial.create([
      {
        event: events[0]._id,
      },
    ] as Array<IEventSocial>);
  });

  it('should create & save eventSocial successfully', async () => {
    const input = new EventSocial(eventSocialFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.event.toString()).toBe(eventSocialFull.event.toString());
    expect(output.event.toString()).toBe(events[0]._id.toString());
    expect(output.facebook).toBe(eventSocialFull.facebook);
    expect(output.twitch).toBe(eventSocialFull.twitch);
    expect(output.twitter).toBe(eventSocialFull.twitter);
    expect(output.discord).toBe(eventSocialFull.discord);
    expect(output.instagram).toBe(eventSocialFull.instagram);
    expect(output.web).toBe(eventSocialFull.web);
    expect(output.youtube).toBe(eventSocialFull.youtube);
    expect(output.meta).toBeDefined();
  });

  it('should create & save min eventSocial successfully', async () => {
    const input = new EventSocial(eventSocialMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.event.toString()).toBe(eventSocialMin.event.toString());
    expect(output.event.toString()).toBe(events[1]._id.toString());
    expect(output.facebook).toBeUndefined();
    expect(output.twitch).toBeUndefined();
    expect(output.twitter).toBeUndefined();
    expect(output.discord).toBeUndefined();
    expect(output.instagram).toBeUndefined();
    expect(output.web).toBeUndefined();
    expect(output.youtube).toBeUndefined();
    expect(output.meta).toBeUndefined();
  });

  it('should populate event', async () => {
    const output = await EventSocial.findById(eventSocial.id).populate(
      '_event',
    );
    expect(output?._event).toBeDefined();
    expect(output?._event?.id).toBe(events[0].id);
  });
});
