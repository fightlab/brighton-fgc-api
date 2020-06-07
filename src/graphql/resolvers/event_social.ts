import { Context, CtxWithArgs } from '@lib/graphql';
import { ObjectId } from 'mongodb';
import {
  Resolver,
  Query,
  Ctx,
  FieldResolver,
  Root,
  ArgsType,
  Field,
  Args,
} from 'type-graphql';
import { EventSocial, EVENT_SOCIAL_DESCRIPTIONS } from '@models/event_social';
import { generateMongooseQueryObject } from '@graphql/resolvers';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { DocumentType } from '@typegoose/typegoose';
import { Event } from '@models/event';
import { EventResolverMethods } from '@graphql/resolvers/event';

@ArgsType()
export class EventSocialArgs {
  @Field(() => ObjectIdScalar, {
    description: EVENT_SOCIAL_DESCRIPTIONS.ID,
    nullable: true,
  })
  id?: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: EVENT_SOCIAL_DESCRIPTIONS.EVENT_ID,
    nullable: true,
  })
  event?: ObjectId;
}

export class EventSocialResolverMethods {
  static async event_social({
    ctx,
    args: { id, event },
  }: CtxWithArgs<EventSocialArgs>): Promise<EventSocial | null> {
    const q = generateMongooseQueryObject();

    if (id) {
      q._id = id;
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
    @Args() { id, event }: EventSocialArgs,
    @Ctx() ctx: Context,
  ): Promise<EventSocial | null> {
    return EventSocialResolverMethods.event_social({
      ctx,
      args: { id, event },
    });
  }

  // event ids
  @FieldResolver(() => ObjectIdScalar, {
    description: EVENT_SOCIAL_DESCRIPTIONS.EVENT_ID,
  })
  event_id(@Root() event_social: DocumentType<EventSocial>): ObjectId {
    return event_social.event as ObjectId;
  }

  // populate event
  @FieldResolver(() => Event, {
    description: EVENT_SOCIAL_DESCRIPTIONS.EVENT,
  })
  event(
    @Root() event_social: DocumentType<EventSocial>,
    @Ctx() ctx: Context,
  ): Promise<Event | null> {
    return EventResolverMethods.event({
      args: {
        id: event_social.event as ObjectId,
      },
      ctx,
    });
  }
}
