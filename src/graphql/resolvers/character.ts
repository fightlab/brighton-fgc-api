// GraphQL Resolver for Bracket Platforms

import { Resolver, Query, Arg, Ctx, FieldResolver, Root } from 'type-graphql';
import { DocumentType } from '@typegoose/typegoose';
import { Character, CHARACTER_DESCRIPTIONS } from '@models/character';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';
import { Context } from '@lib/graphql';
// import { Game } from '@models/game';

@Resolver(() => Character)
export class CharacterResolver {
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

  @Query(() => [Character], {
    description: CHARACTER_DESCRIPTIONS.FIND,
  })
  characters(@Ctx() ctx: Context) {
    // for future querying
    const q = {};
    return ctx.loaders.CharactersLoader.load(q);
  }

  @FieldResolver(() => ObjectIdScalar)
  game_id(@Root() character: DocumentType<Character>) {
    return character.game;
  }

  @FieldResolver()
  game(@Root() character: DocumentType<Character>, @Ctx() ctx: Context) {
    return ctx.loaders.GameLoader.load(character.game);
  }
}
