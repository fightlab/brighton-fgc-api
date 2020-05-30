import { gqlCall, gql } from '@graphql/resolvers/test/helper';
import { DocumentType } from '@typegoose/typegoose';
import { Venue, VenueModel } from '@models/venue';
import { generateVenue, generateEvent } from '@graphql/resolvers/test/generate';
import { every, some, orderBy, isEqual } from 'lodash';
import { ObjectId } from 'mongodb';
import { EventModel, Event } from '@models/event';

describe('Venue GraphQL Resolver Test', () => {
  let venues: Array<DocumentType<Venue>>;

  beforeEach(async () => {
    venues = await VenueModel.create([
      generateVenue(false),
      generateVenue(true),
    ] as Array<Venue>);
  });

  it('should return all venues with fields', async () => {
    const source = gql`
      query GetVenues {
        venues {
          _id
          name
          short
          address
          google_maps
          website
        }
      }
    `;

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venues).toHaveLength(venues.length);

    // check values matches for every element
    // e: each element in every, s: each element in some
    // use nullish coalescing operator for nullable values
    expect(
      every(
        output.data?.venues,
        (e) =>
          some(venues, (s) => s.id === e._id) &&
          some(venues, (s) => s.name === e.name) &&
          some(venues, (s) => s.short === e.short) &&
          some(venues, (s) => (s.address ?? null) === e.address) &&
          some(venues, (s) => (s.google_maps ?? null) === e.google_maps) &&
          some(venues, (s) => (s.website ?? null) === e.website),
      ),
    ).toBe(true);
  });

  it('should return single venue by id', async () => {
    const source = gql`
      query SelectVenue($id: ObjectId!) {
        venue(id: $id) {
          _id
          name
          short
        }
      }
    `;

    const variableValues = {
      id: venues[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venue._id).toBe(venues[0].id);
    expect(output.data?.venue.name).toBe(venues[0].name);
    expect(output.data?.venue.short).toBe(venues[0].short);
  });

  it('should return null if a venue is not found', async () => {
    const source = gql`
      query SelectVenue($id: ObjectId!) {
        venue(id: $id) {
          _id
          name
          short
        }
      }
    `;

    const variableValues = {
      id: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venue).toBeNull();
  });

  it('should sort venues by name asc', async () => {
    const source = gql`
      query SelectVenues {
        venues(sort: NAME_ASC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      venues.map((v) => v.name),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venues).toHaveLength(venues.length);

    const dataFromQuery: Array<any> = output.data?.venues;
    const received: Array<string> = dataFromQuery.map((d) => d.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort venues by name descending', async () => {
    const source = gql`
      query SelectVenues {
        venues(sort: NAME_DESC) {
          _id
          name
        }
      }
    `;

    const expected = orderBy(
      venues.map((v) => v.name),
      [],
      ['desc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venues).toHaveLength(venues.length);

    const dataFromQuery: Array<any> = output.data?.venues;
    const received: Array<string> = dataFromQuery.map((d) => d.name);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should sort venues by id', async () => {
    const source = gql`
      query SelectVenues {
        venues(sort: ID) {
          _id
        }
      }
    `;

    const expected = orderBy(
      venues.map((b) => b.id),
      [],
      ['asc'],
    );

    const output = await gqlCall({
      source,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venues).toHaveLength(venues.length);

    const dataFromQuery: Array<any> = output.data?.venues;
    const received: Array<string> = dataFromQuery.map((p) => p._id);

    expect(isEqual(received, expected)).toBe(true);
  });

  it('should be able to search venues by name', async () => {
    const source = gql`
      query SelectVenues($search: String) {
        venues(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      search: venues[0].name.toLowerCase(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venues).toBeDefined();
    expect(output.data?.venues).toHaveLength(1);
    expect(output.data?.venues[0]._id).toBe(venues[0].id);
    expect(output.data?.venues[0].name).toBe(venues[0].name);
  });

  it('should return empty array if search for venues returns no results', async () => {
    const source = gql`
      query SelectVenues($search: String) {
        venues(search: $search) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      search: 'qqweqewcnoiaskhfnoihoiehtiohfoigafio',
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venues).toBeDefined();
    expect(output.data?.venues).toHaveLength(0);
  });

  it('should search venues by list of ids', async () => {
    const source = gql`
      query SelectVenues($ids: [ObjectId!]) {
        venues(ids: $ids) {
          _id
          name
        }
      }
    `;

    const variableValues = {
      ids: venues.map((p) => p.id),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venues).toBeDefined();
    expect(output.data?.venues).toHaveLength(venues.length);
  });

  it('should populate events for a given venue', async () => {
    // generate some events for a given venue
    const events = await EventModel.create([
      generateEvent(venues[0]._id),
      generateEvent(venues[0]._id),
    ] as Array<Event>);

    const source = gql`
      query SelectVenues($id: ObjectId!) {
        venue(id: $id) {
          _id
          events {
            _id
          }
        }
      }
    `;

    const variableValues = {
      id: venues[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venue).toBeDefined();
    expect(output.data?.venue._id).toBe(venues[0].id);
    expect(output.data?.venue.events).toHaveLength(events.length);
    expect(
      every(output.data?.venue.events, (e) =>
        some(events, (s) => s.id === e._id),
      ),
    ).toBe(true);
  });

  it('should return empty array if events not found for a venue', async () => {
    const source = gql`
      query SelectVenues($id: ObjectId!) {
        venue(id: $id) {
          _id
          events {
            _id
          }
        }
      }
    `;

    const variableValues = {
      id: venues[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.venue).toBeDefined();
    expect(output.data?.venue._id).toBe(venues[0].id);
    expect(output.data?.venue.events).toHaveLength(0);
  });
});
