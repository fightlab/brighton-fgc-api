import { default as moment } from 'moment';
import { DocumentType, isDocument } from '@typegoose/typegoose';
import { EventSocialModel, EventSocial } from '@models/event_social';
import { EventModel, Event } from '@models/event';
import { Types } from 'mongoose';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

describe('EventSocial model test', () => {
  let events: Array<DocumentType<Event>>;
  let eventSocialFull: EventSocial;
  let eventSocialMin: EventSocial;
  let eventSocial: DocumentType<EventSocial>;

  beforeEach(async () => {
    // fake some events
    events = await EventModel.create([
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
    ] as Array<Event>);

    eventSocialFull = {
      event: events[0]._id,
      facebook: 'event social facebook',
      twitch: 'event social twitch',
      discord: 'event social discord',
      instagram: 'event social instagram',
      twitter: 'event social twitter',
      web: 'https://event-social.web',
      youtube: 'event social youtube',
    };

    // not sure why you'd do this but /shrug
    eventSocialMin = {
      event: events[1]._id,
    };

    // add an event social to the collection
    [eventSocial] = await EventSocialModel.create([
      {
        event: events[0]._id,
      },
    ] as Array<EventSocial>);
  });

  it('should create & save eventSocial successfully', async () => {
    const input = new EventSocialModel(eventSocialFull);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.event?.toString()).toBe(eventSocialFull.event?.toString());
    expect(output.event?.toString()).toBe(events[0]._id.toString());
    expect(output.facebook).toBe(eventSocialFull.facebook);
    expect(output.twitch).toBe(eventSocialFull.twitch);
    expect(output.twitter).toBe(eventSocialFull.twitter);
    expect(output.discord).toBe(eventSocialFull.discord);
    expect(output.instagram).toBe(eventSocialFull.instagram);
    expect(output.web).toBe(eventSocialFull.web);
    expect(output.youtube).toBe(eventSocialFull.youtube);
  });

  it('should create & save min eventSocial successfully', async () => {
    const input = new EventSocialModel(eventSocialMin);
    const output = await input.save();

    expect(output._id).toBeDefined();
    expect(output.event?.toString()).toBe(eventSocialMin.event?.toString());
    expect(output.event?.toString()).toBe(events[1]._id.toString());
    expect(output.facebook).toBeUndefined();
    expect(output.twitch).toBeUndefined();
    expect(output.twitter).toBeUndefined();
    expect(output.discord).toBeUndefined();
    expect(output.instagram).toBeUndefined();
    expect(output.web).toBeUndefined();
    expect(output.youtube).toBeUndefined();
  });

  it('should populate event', async () => {
    const output = await EventSocialModel.findById(eventSocial.id).populate(
      'event',
    );
    expect(isDocument(output?.event)).toBe(true);
    if (isDocument(output?.event)) {
      expect(output?.event.id).toBe(events[0].id);
    }
  });

  it('should not validate if web not valid', async () => {
    const input = new EventSocialModel({
      ...eventSocialFull,
      web: 'not-valid-web',
    });

    input.validate((error) => {
      expect(error.errors.web.message).toBe(
        generateValidationMessage(
          'web',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });

  it('should not validate if web not correct type', async () => {
    const input = new EventSocialModel({
      ...eventSocialFull,
      web: 1993,
    });

    input.validate((error) => {
      expect(error.errors.web.message).toBe(
        generateValidationMessage(
          'web',
          VALIDATION_MESSAGES.URL_VALIDATION_ERROR_NO_KEY,
        ),
      );
    });
  });
});
