// GraphQL Resolver for Characters

import {
  Resolver,
  Query,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  registerEnumType,
  ArgsType,
  Field,
  Args,
} from 'type-graphql';
import { DocumentType } from '@typegoose/typegoose';
import { Character, CHARACTER_DESCRIPTIONS } from '@models/character';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { Context } from '@lib/graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { orderBy } from 'lodash';
import { Game } from '@models/game';

// sorting stuff for character
export enum CHARACTER_SORT {
  NAME_ASC,
  NAME_DESC,
  GAME_ID,
  ID,
}

// register the enum with graphql
registerEnumType(CHARACTER_SORT, {
  name: 'CharacterSort',
  description: 'Sort characters by this enum',
});

// turn sort into an array usable by lodash
const mapSort = (sort: CHARACTER_SORT): MapSort => {
  switch (sort) {
    case CHARACTER_SORT.NAME_ASC:
      return ['name', 'asc'];
    case CHARACTER_SORT.NAME_DESC:
      return ['name', 'desc'];
    case CHARACTER_SORT.GAME_ID:
      return ['game', 'asc'];
    default:
      return ['_id', 'asc'];
  }
};

@ArgsType()
export class CharactersArgs {
  @Field(() => [ObjectIdScalar], {
    nullable: true,
    description: CHARACTER_DESCRIPTIONS.IDS,
  })
  ids?: Array<ObjectId>;

  @Field({
    nullable: true,
  })
  search?: string;

  @Field(() => ObjectIdScalar, {
    nullable: true,
    description: CHARACTER_DESCRIPTIONS.GAME_ID,
  })
  game?: ObjectId;

  @Field(() => CHARACTER_SORT, {
    nullable: true,
    defaultValue: CHARACTER_SORT.GAME_ID,
  })
  sort!: CHARACTER_SORT;
}

export class CharacterMethodResolver {
  static async characters({
    search,
    ids,
    game,
    sort = CHARACTER_SORT.GAME_ID,
    ctx,
  }: {
    search?: string;
    ids?: Array<ObjectId>;
    game?: ObjectId;
    sort: CHARACTER_SORT;
    ctx: Context;
  }) {
    const q = generateMongooseQueryObject();

    if (search) {
      q.name = {
        $regex: `${search}`,
        $options: 'i',
      } as MongooseQuery;
    }

    if (ids) {
      q._id = {
        $in: ids,
      } as MongooseQuery;
    }

    if (game) {
      q.game = game;
    }

    const characters = await ctx.loaders.CharactersLoader.load(q);
    const [iteratee, orders] = mapSort(sort);
    return orderBy(characters, iteratee, orders);
  }
}

@Resolver(() => Character)
export class CharacterResolver {
  // get single character
  @Query(() => Character, {
    nullable: true,
    description: CHARACTER_DESCRIPTIONS.FIND_ONE,
  })
  character(
    @Arg('id', () => ObjectIdScalar, {
      description: CHARACTER_DESCRIPTIONS.ID,
    })
    id: ObjectId,
    @Ctx() ctx: Context,
  ) {
    return ctx.loaders.CharacterLoader.load(id);
  }

  // get multiple characters
  @Query(() => [Character], {
    description: CHARACTER_DESCRIPTIONS.FIND,
  })
  characters(
    @Args() { sort, ids, search, game }: CharactersArgs,
    @Ctx() ctx: Context,
  ) {
    return CharacterMethodResolver.characters({
      ctx,
      sort,
      ids,
      game,
      search,
    });
  }

  // add field onto character to return the game id
  @FieldResolver(() => ObjectIdScalar, {
    description: CHARACTER_DESCRIPTIONS.GAME_ID,
  })
  game_id(@Root() character: DocumentType<Character>) {
    return character.game;
  }

  // field resolver for the game
  @FieldResolver(() => Game, {
    description: CHARACTER_DESCRIPTIONS.GAME,
  })
  game(@Root() character: DocumentType<Character>, @Ctx() ctx: Context) {
    return ctx.loaders.GameLoader.load(character.game);
  }

  // TODO: Add matches that character has appeared in
}
