import { DocumentType } from '@typegoose/typegoose';
import { Event, EventModel } from '@models/event';
import { EventSeries, EventSeriesModel } from '@models/event_series';
import {
  generateEvent,
  generateEventSeries,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { chunk, every, some, orderBy, isEqual } from 'lodash';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';

describe('Event Series GraphQL Resolver Test', () => {
  let events: Array<DocumentType<Event>>;
  let eventSeries: Array<DocumentType<EventSeries>>;

  beforeEach(async () => {
    events = await EventModel.create(
      Array.from(
        {
          length: 4,
        },
        () => generateEvent(new ObjectId(), true),
      ),
    );

    const eventSeriesToGenerate = 2;
    const chunkedEvents = chunk(
      events.map((e) => e._id),
      Math.floor(events.length / eventSeriesToGenerate),
    );

    eventSeries = await EventSeriesModel.create(
      Array.from({ length: eventSeriesToGenerate }, (_, i) =>
        generateEventSeries(chunkedEvents[i], !!(i % eventSeriesToGenerate)),
      ),
    );
  });

  it('should return a list of event series', async () => {
    const source = gql`
      query SelectEventSeries {
        event_series {
          _id
          event_ids
          name
          info
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(eventSeries.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    // use nullish coalescing operator for nullable/optional values
    expect(
      every(
        output.data?.event_series,
        (e) =>
          some(eventSeries, (s) => s.id === e._id) &&
          some(eventSeries, (s) => s.name === e.name) &&
          some(eventSeries, (s) => (s.info ?? null) === e.info) &&
          e.event_ids.length > 0,
      ),
    ).toBe(true);
  });

  it('should populate events', async () => {
    const source = gql`
      query SelectEventSeries {
        event_series {
          _id
          events {
            _id
          }
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(eventSeries.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    // use nullish coalescing operator for nullable/optional values
    expect(
      every(
        output.data?.event_series,
        (e) =>
          some(eventSeries, (s) => s.id === e._id) &&
          every(e.events, (ee) => some(events, (s) => s.id === ee._id)),
      ),
    ).toBe(true);
  });

  it('should return events series by event ids', async () => {
    const source = gql`
      query SelectEventSeries($events: [ObjectId!]) {
        event_series(events: $events) {
          _id
        }
      }
    `;

    const variableValues = {
      events: [events[0].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(1);
  });

  it('should return empty array of events if not found', async () => {
    const source = gql`
      query SelectEventSeries($events: [ObjectId!]) {
        event_series(events: $events) {
          _id
        }
      }
    `;

    const variableValues = {
      events: [new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(0);
  });

  it('should return event series by ids', async () => {
    const source = gql`
      query SelectEventSeries($ids: [ObjectId!]) {
        event_series(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [eventSeries[0].id],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(1);
  });

  it('should return empty array if ids do not exist', async () => {
    const source = gql`
      query SelectEventSeries($ids: [ObjectId!]) {
        event_series(ids: $ids) {
          _id
        }
      }
    `;

    const variableValues = {
      ids: [new ObjectId()],
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(0);
  });

  it('should search event series by name', async () => {
    const source = gql`
      query SelectEventSeries($search: String) {
        event_series(search: $search) {
          _id
        }
      }
    `;

    const variableValues = {
      search: eventSeries[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(1);
  });

  it('should return empty array if event series not found for a name search', async () => {
    const source = gql`
      query SelectEventSeries($search: String) {
        event_series(search: $search) {
          _id
        }
      }
    `;

    const variableValues = {
      search: `jiofahfoi8qyhf9 803y1809rfyh8o0ifyhih iuhfi`,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(0);
  });

  it('should sort event series by name asc', async () => {
    const source = gql`
      query SelectEventSeries {
        event_series(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      eventSeries.map((e) => e.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(eventSeries.length);

    const dataFromQuery: Array<any> = output.data?.event_series;
    const received: Array<string> = dataFromQuery.map((p) => p.name);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort event series by name descending', async () => {
    const source = gql`
      query SelectEventSeries {
        event_series(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      eventSeries.map((e) => e.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(eventSeries.length);

    const dataFromQuery: Array<any> = output.data?.event_series;
    const received: Array<string> = dataFromQuery.map((p) => p.name);
    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort event series by id', async () => {
    const source = gql`
      query SelectEventSeries {
        event_series(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      eventSeries.map((e) => e.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_series).toHaveLength(eventSeries.length);

    const dataFromQuery: Array<any> = output.data?.event_series;
    const received: Array<string> = dataFromQuery.map((p) => p._id);
    expect(isEqual(received, expected)).toBe(true);
  });
});
