import { Context } from '@lib/graphql';
import { ObjectId } from 'mongodb';
import { Resolver, Query, Arg, Ctx, FieldResolver, Root } from 'type-graphql';
import { EventSocial, EVENT_SOCIAL_DESCRIPTIONS } from '@models/event_social';
import { generateMongooseQueryObject } from '@graphql/resolvers';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { DocumentType } from '@typegoose/typegoose';
import { Event } from '@models/event';

export class EventSocialResolverMethods {
  static async event_social({
    ctx,
    event,
    _id,
  }: {
    ctx: Context;
    event?: ObjectId;
    _id?: ObjectId;
  }) {
    const q = generateMongooseQueryObject();

    if (_id) {
      q._id = _id;
    }

    if (event) {
      q.event = event;
    }

    const [eventSocial = null] = await ctx.loaders.EventSocialsLoader.load(q);
    return eventSocial;
  }
}

@Resolver(() => EventSocial)
export class EventSocialResolver {
  @Query(() => EventSocial, {
    description: EVENT_SOCIAL_DESCRIPTIONS.FIND,
    nullable: true,
  })
  event_social(
    @Arg('id', () => ObjectIdScalar, {
      description: EVENT_SOCIAL_DESCRIPTIONS.ID,
      nullable: true,
    })
    _id: ObjectId,
    @Arg('event', () => ObjectIdScalar, {
      description: EVENT_SOCIAL_DESCRIPTIONS.EVENT_ID,
      nullable: true,
    })
    event: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return EventSocialResolverMethods.event_social({ ctx, _id, event });
  }

  // event ids
  @FieldResolver(() => ObjectIdScalar, {
    description: EVENT_SOCIAL_DESCRIPTIONS.EVENT_ID,
  })
  event_id(@Root() event_social: DocumentType<EventSocial>) {
    return event_social.event;
  }

  // populate event
  @FieldResolver(() => Event, {
    description: EVENT_SOCIAL_DESCRIPTIONS.EVENT,
  })
  event(@Root() event_social: DocumentType<EventSocial>, @Ctx() ctx: Context) {
    return ctx.loaders.EventLoader.load(event_social.event);
  }
}
