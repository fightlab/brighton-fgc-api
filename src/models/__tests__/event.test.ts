import { default as faker } from 'faker';
import { default as moment } from 'moment';
import { DocumentType, isDocument } from '@typegoose/typegoose';
import { Event, EventClass } from '@models/event';
import { Venue, VenueClass } from '@models/venue';
import {
  VALIDATION_MESSAGES,
  generateValidationMessage,
} from '@lib/validation';

describe('Event model test', () => {
  let venues: Array<DocumentType<VenueClass>>;
  let eventFull: EventClass;
  let eventMin: EventClass;
  let event: DocumentType<EventClass>;
  const invalidDateString = 'lmao fake date';

  beforeEach(async () => {
    // fake some venues
    venues = await Venue.create([
      {
        name: 'A Pub',
        short: 'PUB',
      },
      {
        name: 'A Flat',
        short: 'FLAT',
      },
    ] as Array<VenueClass>);

    eventFull = {
      name: 'Event Full',
      date_start: moment.utc().add(1, 'h').toDate(),
      date_end: moment.utc().add(5, 'h').toDate(),
      venue: venues[0]._id,
      short: 'EF',
      info: faker.lorem.paragraph(),
    };

    eventMin = {
      name: 'Event Min',
      date_start: moment.utc().add(1, 'h').toDate(),
      date_end: moment.utc().add(5, 'h').toDate(),
      venue: venues[1]._id,
    };

    // add an event to the collection
    [event] = await Event.create([
      {
        name: 'Event',
        date_start: moment.utc().add(1, 'h').toDate(),
        date_end: moment.utc().add(5, 'h').toDate(),
        venue: venues[0]._id,
      },
    ] as Array<EventClass>);
  });

  it('should create & save event successfully', async () => {
    const input = new Event(eventFull);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output.venue)).toBe(false);

    expect(output.name).toBe(eventFull.name);
    expect(output.date_start.getTime()).toBe(eventFull.date_start.getTime());
    expect(output.date_end.getTime()).toBe(eventFull.date_end.getTime());
    expect(output.venue?.toString()).toBe(eventFull.venue?.toString());
    expect(output.venue?.toString()).toBe(venues[0]._id.toString());
    expect(output.short).toBe(eventFull.short);
    expect(output.info).toBe(eventFull.info);
  });

  it('should create & save min event successfully', async () => {
    const input = new Event(eventMin);
    const output = await input.save();

    expect(output._id).toBeDefined();

    // shouldn't populate virtuals
    expect(isDocument(output.venue)).toBe(false);

    expect(output.name).toBe(eventMin.name);
    expect(output.date_start.getTime()).toBe(eventMin.date_start.getTime());
    expect(output.date_end.getTime()).toBe(eventMin.date_end.getTime());
    expect(output.venue?.toString()).toBe(eventMin.venue?.toString());
    expect(output.venue?.toString()).toBe(venues[1]._id.toString());
    expect(output.short).toBeUndefined();
    expect(output.info).toBeUndefined();
  });

  it('should fail validation if trying to save with invalid start date', async () => {
    const input = new Event({
      name: 'Event Invalid Start Date',
      date_start: invalidDateString,
      date_end: moment.utc().add(5, 'h').toDate(),
      venue: venues[0]._id,
    });

    input.validate((error) => {
      expect(error.errors.date_start.message).toBe(
        `Cast to date failed for value "${invalidDateString}" at path "date_start"`,
      );
    });
  });

  it('should fail validation if trying to save with invalid end date', async () => {
    const input = new Event({
      name: 'Event Invalid End Date',
      date_start: moment.utc().add(1, 'h').toDate(),
      date_end: invalidDateString,
      venue: venues[0]._id,
    });

    input.validate((error) => {
      expect(error.errors.date_end.message).toBe(
        `Cast to date failed for value "${invalidDateString}" at path "date_end"`,
      );
    });
  });

  it('should fail validation if start date after end date', async () => {
    const input = new Event({
      name: 'Event Min',
      date_start: moment.utc().add(5, 'h').toDate(),
      date_end: moment.utc().add(1, 'h').toDate(),
      venue: venues[0]._id,
    });

    input.validate((error) => {
      expect(error.errors.date_start.message).toBe(
        generateValidationMessage(
          'date_start',
          VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
        ),
      );
    });
  });

  it('should fail validation if end date before start date', async () => {
    const input = new Event({
      name: 'Event Min',
      date_start: moment.utc().add(5, 'h').toDate(),
      date_end: moment.utc().add(1, 'h').toDate(),
      venue: venues[0]._id,
    });

    input.validate((error) => {
      expect(error.errors.date_end.message).toBe(
        generateValidationMessage(
          'date_end',
          VALIDATION_MESSAGES.DATE_VALIDATION_ERROR,
        ),
      );
    });
  });

  it('should populate venue', async () => {
    const output = await Event.findById(event.id).populate('venue');
    expect(isDocument(output?.venue)).toBe(true);
    if (isDocument(output?.venue)) {
      expect(output?.venue?.id).toBe(venues[0].id);
      expect(output?.venue?.name).toBe(venues[0].name);
    }
  });
});
