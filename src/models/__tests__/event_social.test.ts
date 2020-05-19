import { EventSocial, IEventSocial } from '@models/event_social';
import { Event } from '@models/event';

describe('EventSocial model test', () => {
  let events: Array<Event>;
  let eventSocialFull: IEventSocial;
  let eventSocialMin: IEventSocial;

  beforeAll(async () => {
    events = await Event.find().limit(2);

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
    expect(output.facebook).toBeUndefined();
    expect(output.twitch).toBeUndefined();
    expect(output.twitter).toBeUndefined();
    expect(output.discord).toBeUndefined();
    expect(output.instagram).toBeUndefined();
    expect(output.web).toBeUndefined();
    expect(output.youtube).toBeUndefined();
    expect(output.meta).toBeUndefined();
  });

  it('should populate events', async () => {
    const output = await EventSocial.findOne().populate('_event');
    expect(output?.event).toBeDefined();
  });
});
