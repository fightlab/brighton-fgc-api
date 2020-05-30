import { DocumentType } from '@typegoose/typegoose';
import { Venue, VenueModel } from '@models/venue';
import { Event, EventModel } from '@models/event';
import { generateVenue, generateEvent } from '@graphql/resolvers/test/generate';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';
import { every, some, orderBy, isEqual } from 'lodash';
import { ObjectId } from 'mongodb';
import moment from 'moment';

describe('Event GraphQL Resolver Test', () => {
  let venues: Array<DocumentType<Venue>>;
  let events: Array<DocumentType<Event>>;

  beforeEach(async () => {
    venues = await VenueModel.create(
      Array.from(
        {
          length: 2,
        },
        () => generateVenue(true),
      ) as Array<Venue>,
    );

    events = await EventModel.create([
      generateEvent(venues[0]._id, false),
      generateEvent(venues[1]._id, true),
    ] as Array<Event>);
  });

  it('should return all events with fields', async () => {
    const source = gql`
      query SelectEvents {
        events {
          _id
          name
          date_start
          date_end
          short
          info
          venue_id
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    // use nullish coalescing operator for nullable/optional values
    expect(
      every(
        output.data?.events,
        (e) =>
          some(events, (s) => s.id === e._id) &&
          some(events, (s) => s.name === e.name) &&
          some(events, (s) => s.date_start.toISOString() === e.date_start) &&
          some(events, (s) => s.date_end.toISOString() === e.date_end) &&
          some(events, (s) => s.venue?.toString() === e.venue_id) &&
          some(events, (s) => (s.short ?? null) === e.short) &&
          some(events, (s) => (s.info ?? null) === e.info),
      ),
    ).toBe(true);
  });

  it('should return a single event by id', async () => {
    const source = gql`
      query SelectEvents($id: ObjectId!) {
        event(id: $id) {
          _id
          name
          date_start
          date_end
          short
          info
          venue_id
        }
      }
    `;

    const variableValues = {
      id: events[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event._id).toBe(events[0].id);
    expect(output.data?.event.name).toBe(events[0].name);
    expect(output.data?.event.date_start).toBe(
      events[0].date_start.toISOString(),
    );
    expect(output.data?.event.date_end).toBe(events[0].date_end.toISOString());
    expect(output.data?.event.short).toBe(events[0].short);
    expect(output.data?.event.info).toBe(events[0].info);
    expect(output.data?.event.venue_id).toBe(events[0].venue?.toString());
  });

  it('should return null if event id not found', async () => {
    const source = gql`
      query SelectEvents($id: ObjectId!) {
        event(id: $id) {
          _id
        }
      }
    `;

    const variableValues = {
      id: new ObjectId(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event).toBeNull();
  });

  it('should populate venue for a given event', async () => {
    const source = gql`
      query SelectEvents($id: ObjectId!) {
        event(id: $id) {
          _id
          venue {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: events[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event._id).toBe(events[0].id);
    expect(output.data?.event.venue._id).toBe(events[0].venue?.toString());
    expect(output.data?.event.venue._id).toBe(venues[0].id);
    expect(output.data?.event.venue.name).toBe(venues[0].name);
  });

  it('should sort events by name asc', async () => {
    const source = gql`
      query SelectEvents {
        events(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      events.map((e) => e.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    const dataFromQuery: Array<any> = output.data?.events;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort events by name desc', async () => {
    const source = gql`
      query SelectEvents {
        events(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      events.map((e) => e.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    const dataFromQuery: Array<any> = output.data?.events;
    const received: Array<string> = dataFromQuery.map((p) => p.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort events by date start asc', async () => {
    const source = gql`
      query SelectEvents {
        events(sort: DATE_START_ASC) {
          _id
          date_start
        }
      }
    `;

    const expected = orderBy(
      events.map((e) => e.date_start.toISOString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    const dataFromQuery: Array<any> = output.data?.events;
    const received: Array<string> = dataFromQuery.map((p) => p.date_start);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort events by date start desc', async () => {
    const source = gql`
      query SelectEvents {
        events(sort: DATE_START_DESC) {
          _id
          date_start
        }
      }
    `;

    const expected = orderBy(
      events.map((e) => e.date_start.toISOString()),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    const dataFromQuery: Array<any> = output.data?.events;
    const received: Array<string> = dataFromQuery.map((p) => p.date_start);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort events by date end asc', async () => {
    const source = gql`
      query SelectEvents {
        events(sort: DATE_END_ASC) {
          _id
          date_end
        }
      }
    `;

    const expected = orderBy(
      events.map((e) => e.date_end.toISOString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    const dataFromQuery: Array<any> = output.data?.events;
    const received: Array<string> = dataFromQuery.map((p) => p.date_end);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort events by date end desc', async () => {
    const source = gql`
      query SelectEvents {
        events(sort: DATE_END_DESC) {
          _id
          date_end
        }
      }
    `;

    const expected = orderBy(
      events.map((e) => e.date_end.toISOString()),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    const dataFromQuery: Array<any> = output.data?.events;
    const received: Array<string> = dataFromQuery.map((p) => p.date_end);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort events by venue id', async () => {
    const source = gql`
      query SelectEvents {
        events(sort: VENUE_ID) {
          _id
          venue_id
        }
      }
    `;

    const expected = orderBy(
      events.map((e) => e.venue?.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    const dataFromQuery: Array<any> = output.data?.events;
    const received: Array<string> = dataFromQuery.map((p) => p.venue_id);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort events by id', async () => {
    const source = gql`
      query SelectEvents {
        events(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      events.map((e) => e._id.toString()),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);

    const dataFromQuery: Array<any> = output.data?.events;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should search events by name', async () => {
    const source = gql`
      query SelectEvents($search: String!) {
        events(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // search by name lowercase to check it works
      search: events[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toBeDefined();
    expect(output.data?.events).toHaveLength(1);
    expect(output.data?.events[0]._id).toBe(events[0].id);
    expect(output.data?.events[0].name).toBe(events[0].name);
  });

  it('should return empty array if search by name returned no results', async () => {
    const source = gql`
      query SelectEvents($search: String!) {
        events(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      // use unintelligible string, highly unlikely it will be an actual name
      search: 'qqweqewcnoiaskhfnoihoiehtiohfoigafio',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toBeDefined();
    expect(output.data?.events).toHaveLength(0);
  });

  it('should search events by list of ids', async () => {
    const source = gql`
      query SelectEvents($ids: [ObjectId!]) {
        events(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: events.map((p) => p.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toBeDefined();
    expect(output.data?.events).toHaveLength(events.length);
  });

  it('should return empty array if list of ids returned no results', async () => {
    const source = gql`
      query SelectEvents($ids: [ObjectId!]) {
        events(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [new ObjectId().toHexString(), new ObjectId().toHexString()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.events).toBeDefined();
    expect(output.data?.events).toHaveLength(0);
  });

  it('should return events between 2 start dates', async () => {
    // choose a date before a known event
    const dateStartIsAfter = moment.utc(events[0].date_start).subtract(1, 'd');

    // choose a date after a known event
    const dateStartIsBefore = moment.utc(events[0].date_start).add(1, 'd');

    const source = gql`
      query SelectEvents(
        $date_start_gte: DateTime!
        $date_start_lte: DateTime!
      ) {
        events(
          date_start_gte: $date_start_gte
          date_start_lte: $date_start_lte
        ) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_gte: dateStartIsAfter.toISOString(),
      date_start_lte: dateStartIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.events, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return (
          dateStartAsMoment.isAfter(dateStartIsAfter) &&
          dateStartAsMoment.isBefore(dateStartIsBefore)
        );
      }),
    ).toBe(true);
  });

  it('should return events between 2 end dates', async () => {
    // choose a date before a known event
    const dateEndIsAfter = moment.utc(events[0].date_end).subtract(1, 'd');

    // choose a date after a known event
    const dateEndIsBefore = moment.utc(events[0].date_end).add(1, 'd');

    const source = gql`
      query SelectEvents($date_end_gte: DateTime!, $date_end_lte: DateTime!) {
        events(date_end_gte: $date_end_gte, date_end_lte: $date_end_lte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_gte: dateEndIsAfter.toISOString(),
      date_end_lte: dateEndIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.events, (e) => {
        const dateEndAsMoment = moment(e.date_end);
        return (
          dateEndAsMoment.isAfter(dateEndIsAfter) &&
          dateEndAsMoment.isBefore(dateEndIsBefore)
        );
      }),
    ).toBe(true);
  });

  it('should return empty array if no event found between start dates', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateStartIsAfter = moment.utc('2000-01-01');

    // choose a date also far in the past, but after the isAfter
    const dateStartIsBefore = moment.utc('2000-01-02');

    const source = gql`
      query SelectEvents(
        $date_start_gte: DateTime!
        $date_start_lte: DateTime!
      ) {
        events(
          date_start_gte: $date_start_gte
          date_start_lte: $date_start_lte
        ) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_gte: dateStartIsAfter.toISOString(),
      date_start_lte: dateStartIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events).toHaveLength(0);
  });

  it('should return empty array if no event found between end date', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateEndIsAfter = moment.utc('2000-01-01');

    // choose a date also far in the past, but after the isAfter
    const dateEndIsBefore = moment.utc('2000-01-02');

    const source = gql`
      query SelectEvents($date_end_gte: DateTime!, $date_end_lte: DateTime!) {
        events(date_end_gte: $date_end_gte, date_end_lte: $date_end_lte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_gte: dateEndIsAfter.toISOString(),
      date_end_lte: dateEndIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events).toHaveLength(0);
  });

  it('should return events greater than a start date', async () => {
    // choose a date before a known event
    const dateStartIsAfter = moment.utc(events[0].date_start).subtract(1, 'd');

    const source = gql`
      query SelectEvents($date_start_gte: DateTime!) {
        events(date_start_gte: $date_start_gte) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_gte: dateStartIsAfter.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.events, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return dateStartAsMoment.isAfter(dateStartIsAfter);
      }),
    ).toBe(true);
  });

  it('should return events greater than a end date', async () => {
    // choose a date before a known event
    const dateEndIsAfter = moment.utc(events[0].date_end).subtract(1, 'd');

    const source = gql`
      query SelectEvents($date_end_gte: DateTime!) {
        events(date_end_gte: $date_end_gte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_gte: dateEndIsAfter.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.events, (e) => {
        const dateEndAsMoment = moment(e.date_end);
        return dateEndAsMoment.isAfter(dateEndIsAfter);
      }),
    ).toBe(true);
  });

  it('should return events less than a start date', async () => {
    // choose a date after a known event
    const dateStartIsBefore = moment.utc(events[0].date_start).add(1, 'd');

    const source = gql`
      query SelectEvents($date_start_lte: DateTime!) {
        events(date_start_lte: $date_start_lte) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_lte: dateStartIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.events, (e) => {
        const dateStartAsMoment = moment(e.date_start);
        return dateStartAsMoment.isBefore(dateStartIsBefore);
      }),
    ).toBe(true);
  });

  it('should return events less than a end date', async () => {
    // choose a date after a known event
    const dateEndIsBefore = moment.utc(events[0].date_end).add(1, 'd');

    const source = gql`
      query SelectEvents($date_end_lte: DateTime!) {
        events(date_end_lte: $date_end_lte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_lte: dateEndIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events.length).toBeGreaterThan(0);
    // check every date is between the dates
    expect(
      every(output.data?.events, (e) => {
        const dateEndAsMoment = moment(e.date_end);
        return dateEndAsMoment.isBefore(dateEndIsBefore);
      }),
    ).toBe(true);
  });

  it('should return empty array if no event found before start date', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateStartIsBefore = moment.utc('2000-01-01');

    const source = gql`
      query SelectEvents($date_start_lte: DateTime!) {
        events(date_start_lte: $date_start_lte) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_lte: dateStartIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events).toHaveLength(0);
  });

  it('should return empty array if no event found after start date', async () => {
    // choose a date in far in the future, the year 3000 is a good bet ;)
    const dateStartIsAfter = moment.utc('3000-01-01');

    const source = gql`
      query SelectEvents($date_start_gte: DateTime!) {
        events(date_start_gte: $date_start_gte) {
          _id
          date_start
        }
      }
    `;

    const variableValues = {
      date_start_gte: dateStartIsAfter.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events).toHaveLength(0);
  });

  it('should return empty array if no event found before end date', async () => {
    // choose a date in far in the past, the year 2000 is a good bet ;)
    const dateEndIsBefore = moment.utc('2000-01-01');

    const source = gql`
      query SelectEvents($date_end_lte: DateTime!) {
        events(date_end_lte: $date_end_lte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_lte: dateEndIsBefore.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events).toHaveLength(0);
  });

  it('should return empty array if no event found after end date', async () => {
    // choose a date in far in the future, the year 3000 is a good bet ;)
    const dateEndIsAfter = moment.utc('3000-01-01');

    const source = gql`
      query SelectEvents($date_end_gte: DateTime!) {
        events(date_end_gte: $date_end_gte) {
          _id
          date_end
        }
      }
    `;

    const variableValues = {
      date_end_gte: dateEndIsAfter.toISOString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    // should find some events
    expect(output.data?.events).toHaveLength(0);
  });
});
