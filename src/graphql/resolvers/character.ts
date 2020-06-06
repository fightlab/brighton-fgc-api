// GraphQL Resolver for Characters

import {
  Resolver,
  Query,
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
import { Context, CtxWithArgs } from '@lib/graphql';
import {
  MapSort,
  generateMongooseQueryObject,
  MongooseQuery,
} from '@graphql/resolvers';
import { orderBy } from 'lodash';
import { Game } from '@models/game';
import { GameResolverMethods } from '@graphql/resolvers/game';

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

// argument for character
@ArgsType()
export class CharacterArgs {
  @Field(() => ObjectIdScalar, {
    description: CHARACTER_DESCRIPTIONS.ID,
  })
  id!: ObjectId;
}

// arguments for characters
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

export class CharacterResolverMethods {
  static character({ args: { id }, ctx }: CtxWithArgs<CharacterArgs>) {
    return ctx.loaders.CharacterLoader.load(id);
  }

  static async characters({
    args: { search, ids, game, sort = CHARACTER_SORT.GAME_ID },
    ctx,
  }: CtxWithArgs<CharactersArgs>) {
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
  character(@Args() { id }: CharacterArgs, @Ctx() ctx: Context) {
    return CharacterResolverMethods.character({ args: { id }, ctx });
  }

  // get multiple characters
  @Query(() => [Character], {
    description: CHARACTER_DESCRIPTIONS.FIND,
  })
  characters(
    @Args() { sort, ids, search, game }: CharactersArgs,
    @Ctx() ctx: Context,
  ) {
    return CharacterResolverMethods.characters({
      args: { sort, ids, game, search },
      ctx,
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
    return GameResolverMethods.game({
      args: { id: character.game as ObjectId },
      ctx,
    });
  }

  // TODO: Add matches that character has appeared in
}
