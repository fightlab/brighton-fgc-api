import { DocumentType } from '@typegoose/typegoose';
import { Event, EventModel } from '@models/event';
import { EventSocial, EventSocialModel } from '@models/event_social';
import {
  generateEvent,
  generateEventSocial,
} from '@graphql/resolvers/test/generate';
import { ObjectId } from 'mongodb';
import { gql, gqlCall } from '@graphql/resolvers/test/helper';

describe('Event Social GraphQL Resolver Test', () => {
  let events: Array<DocumentType<Event>>;
  let eventSocials: Array<DocumentType<EventSocial>>;

  beforeEach(async () => {
    events = await EventModel.create(
      Array.from(
        {
          length: 2,
        },
        () => generateEvent(new ObjectId(), true),
      ),
    );

    eventSocials = await EventSocialModel.create([
      generateEventSocial(events[0]._id, 'full'),
      generateEventSocial(events[1]._id, 'random'),
    ] as Array<EventSocial>);
  });

  it('should return event social by id', async () => {
    const source = gql`
      query SelectEventSocial($id: ObjectId!) {
        event_social(id: $id) {
          _id
          event_id
          facebook
          web
          twitter
          discord
          instagram
          twitch
          youtube
        }
      }
    `;

    const variableValues = {
      id: eventSocials[0].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });
    console.log(output);
    expect(output.data).toBeDefined();
    expect(output.data?.event_social).toBeDefined();
    expect(output.data?.event_social._id).toBe(eventSocials[0].id);
    expect(output.data?.event_social.event_id).toBe(
      eventSocials[0].event?.toString(),
    );
    expect(output.data?.event_social.event_id).toBe(events[0].id);
    expect(output.data?.event_social.facebook).toBe(eventSocials[0].facebook);
    expect(output.data?.event_social.web).toBe(eventSocials[0].web);
    expect(output.data?.event_social.twitter).toBe(eventSocials[0].twitter);
    expect(output.data?.event_social.discord).toBe(eventSocials[0].discord);
    expect(output.data?.event_social.instagram).toBe(eventSocials[0].instagram);
    expect(output.data?.event_social.twitch).toBe(eventSocials[0].twitch);
    expect(output.data?.event_social.youtube).toBe(eventSocials[0].youtube);
  });

  it('should return event social by event', async () => {
    const source = gql`
      query SelectEventSocial($event: ObjectId!) {
        event_social(event: $event) {
          _id
          event_id
        }
      }
    `;

    const variableValues = {
      event: events[1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_social).toBeDefined();
    expect(output.data?.event_social._id).toBe(eventSocials[1].id);
    expect(output.data?.event_social.event_id).toBe(
      eventSocials[1].event?.toString(),
    );
    expect(output.data?.event_social.event_id).toBe(events[1].id);
  });

  it('should populate event', async () => {
    const source = gql`
      query SelectEventSocial($id: ObjectId!) {
        event_social(id: $id) {
          _id
          event {
            _id
            name
          }
        }
      }
    `;

    const variableValues = {
      id: eventSocials[1].id,
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_social).toBeDefined();
    expect(output.data?.event_social._id).toBe(eventSocials[1].id);
    expect(output.data?.event_social.event._id).toBe(
      eventSocials[1].event?.toString(),
    );
    expect(output.data?.event_social.event._id).toBe(events[1].id);
    expect(output.data?.event_social.event.name).toBe(events[1].name);
  });

  it('should return null if not found by id', async () => {
    const source = gql`
      query SelectEventSocial($id: ObjectId!) {
        event_social(id: $id) {
          _id
          event_id
          facebook
          web
          twitter
          discord
          instagram
          twitch
          youtube
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
    expect(output.data?.event_social).toBeNull();
  });

  it('should return null if not found for event', async () => {
    const source = gql`
      query SelectEventSocial($event: ObjectId!) {
        event_social(event: $event) {
          _id
          event_id
        }
      }
    `;

    const variableValues = {
      event: new ObjectId().toHexString(),
    };

    const output = await gqlCall({
      source,
      variableValues,
    });

    expect(output.data).toBeDefined();
    expect(output.data?.event_social).toBeNull();
  });
});
