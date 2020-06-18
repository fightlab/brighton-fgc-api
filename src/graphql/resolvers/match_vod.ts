import {
  registerEnumType,
  ArgsType,
  Field,
  Resolver,
  Query,
  Args,
  Ctx,
  Root,
  FieldResolver,
} from 'type-graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { MATCH_VOD_DESCRIPTIONS, MatchVod } from '@models/match_vod';
import { ObjectId } from 'mongodb';
import { CtxWithArgs, Context } from '@lib/graphql';
import { orderBy } from 'lodash';
import { DocumentType } from '@typegoose/typegoose';
import { MatchResolverMethods } from '@graphql/resolvers/match';
import { Match } from '@models/match';
import { Vod } from '@models/vod';
import { VodResolverMethods } from '@graphql/resolvers/vod';
import { Character } from '@models/character';
import {
  CharactersArgs,
  CharacterResolverMethods,
} from '@graphql/resolvers/character';

// sort enum
export enum MATCH_VOD_SORT {
  VOD_ID,
  MATCH_ID,
  ID,
}

// register sort enum
registerEnumType(MATCH_VOD_SORT, {
  name: 'MatchVodSort',
  description: 'Sort match VODs by this enum',
});

// map sort to make it usable
export const mapSort = (sort: MATCH_VOD_SORT): MapSort => {
  switch (sort) {
    case MATCH_VOD_SORT.VOD_ID:
      return ['vod', 'asc'];
    case MATCH_VOD_SORT.MATCH_ID:
      return ['match', 'asc'];
    default:
      return ['_id', 'asc'];
  }
};

// single args
@ArgsType()
export class MatchVodArgs {
  @Field(() => ObjectIdScalar, {
    description: MATCH_VOD_DESCRIPTIONS.ID,
    nullable: true,
  })
  id?: ObjectId;

  @Field(() => ObjectIdScalar, {
    description: MATCH_VOD_DESCRIPTIONS.MATCH_ID,
    nullable: true,
  })
  match?: ObjectId;
}

// multi args
@ArgsType()
export class MatchVodsArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_VOD_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_VOD_DESCRIPTIONS.MATCH_IDS,
  })
  matches?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_VOD_DESCRIPTIONS.VOD_IDS,
  })
  vods?: Array<ObjectId>;

  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: MATCH_VOD_DESCRIPTIONS.CHARACTER_IDS,
  })
  characters?: Array<ObjectId>;

  @Field(() => MATCH_VOD_SORT, {
    nullable: true,
    defaultValue: MATCH_VOD_SORT.ID,
  })
  sort!: MATCH_VOD_SORT;
}

// resolver methods
export class MatchVodResolverMethods {
  static async match_vod({
    ctx,
    args: { id, match },
  }: CtxWithArgs<MatchVodArgs>): Promise<MatchVod | null> {
    if (!id && !match) {
      return null;
    }

    if (id) {
      return ctx.loaders.MatchVodLoader.load(id);
    }

    const q = generateMongooseQueryObject();
    q.match = match;

    const [matchVod = null] = await ctx.loaders.MatchVodsLoader.load(q);
    return matchVod;
  }

  static async match_vods({
    ctx,
    args: { sort, characters, ids, matches, vods },
  }: CtxWithArgs<MatchVodsArgs>): Promise<Array<MatchVod>> {
    const q = generateMongooseQueryObject();

    if (ids) {
      q._id = {
        $in: ids,
      } as MongooseQuery;
    }

    if (matches) {
      q.match = {
        $in: matches,
      } as MongooseQuery;
    }

    if (vods) {
      q.vod = {
        $in: vods,
      } as MongooseQuery;
    }

    if (characters) {
      q.characters = {
        $in: characters,
      } as MongooseQuery;
    }

    const matchVods = await ctx.loaders.MatchVodsLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(matchVods, iteratee, orders);
  }
}

// resolver
@Resolver(() => MatchVod)
export class MatchVodResolver {
  // get single match vod by id, or match and vod
  @Query(() => MatchVod, {
    nullable: true,
    description: MATCH_VOD_DESCRIPTIONS.FIND_ONE,
  })
  match_vod(
    @Args() { id, match }: MatchVodArgs,
    @Ctx() ctx: Context,
  ): Promise<MatchVod | null> {
    return MatchVodResolverMethods.match_vod({ ctx, args: { id, match } });
  }

  @Query(() => [MatchVod], {
    description: MATCH_VOD_DESCRIPTIONS.FIND,
  })
  match_vods(
    @Args() { sort, characters, ids, matches, vods }: MatchVodsArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<MatchVod>> {
    return MatchVodResolverMethods.match_vods({
      ctx,
      args: { sort, characters, ids, matches, vods },
    });
  }

  // match id field resolver
  @FieldResolver(() => ObjectIdScalar, {
    description: MATCH_VOD_DESCRIPTIONS.MATCH_ID,
  })
  match_id(@Root() match_vod: DocumentType<MatchVod>): ObjectId {
    return match_vod.match as ObjectId;
  }

  // match field resolver
  @FieldResolver({
    description: MATCH_VOD_DESCRIPTIONS.MATCH,
  })
  match(
    @Root() match_vod: DocumentType<MatchVod>,
    @Ctx() ctx: Context,
  ): Promise<Match | null> {
    return MatchResolverMethods.match({
      ctx,
      args: { id: match_vod.match as ObjectId },
    });
  }

  // vod id field resolver
  @FieldResolver(() => ObjectIdScalar, {
    description: MATCH_VOD_DESCRIPTIONS.VOD_ID,
  })
  vod_id(@Root() match_vod: DocumentType<MatchVod>): ObjectId {
    return match_vod.vod as ObjectId;
  }

  // vod field resolver
  @FieldResolver({
    description: MATCH_VOD_DESCRIPTIONS.MATCH,
  })
  vod(
    @Root() match_vod: DocumentType<MatchVod>,
    @Ctx() ctx: Context,
  ): Promise<Vod | null> {
    return VodResolverMethods.vod({
      ctx,
      args: { id: match_vod.vod as ObjectId },
    });
  }

  // character ids field resolver
  @FieldResolver(() => [ObjectIdScalar], {
    description: MATCH_VOD_DESCRIPTIONS.CHARACTER_IDS,
    nullable: true,
  })
  character_ids(@Root() match_vod: DocumentType<MatchVod>): Array<ObjectId> {
    return match_vod.characters as Array<ObjectId>;
  }

  // characters field resolver
  @FieldResolver({
    description: MATCH_VOD_DESCRIPTIONS.CHARACTERS,
  })
  characters(
    @Root() match_vod: DocumentType<MatchVod>,
    @Args() { sort, search }: CharactersArgs,
    @Ctx() ctx: Context,
  ): Promise<Array<Character>> {
    return CharacterResolverMethods.characters({
      ctx,
      args: { ids: match_vod.characters as Array<ObjectId>, sort, search },
    });
  }
}
