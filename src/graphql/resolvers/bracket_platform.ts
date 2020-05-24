// import { ObjectId } from 'mongodb';
import {
  Resolver,
  Query,
  // FieldResolver,
  Arg,
  // Root,
  // Mutation,
  // Ctx,
} from 'type-graphql';
import {
  BracketPlatform,
  BracketPlatformModel,
  BRACKET_PLATFORM_DESCRIPTIONS,
} from '@models/bracket_platform';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { ObjectId } from 'mongodb';

@Resolver(() => BracketPlatform)
export class BracketPlatformResolver {
  @Query(() => BracketPlatform, {
    nullable: true,
    description: BRACKET_PLATFORM_DESCRIPTIONS.FIND_ONE,
  })
  bracket_platform(
    @Arg('id', () => ObjectIdScalar, {
      description: BRACKET_PLATFORM_DESCRIPTIONS.ID,
    })
    id: ObjectId,
  ) {
    return BracketPlatformModel.findById(id);
  }

  @Query(() => [BracketPlatform], {
    description: BRACKET_PLATFORM_DESCRIPTIONS.FIND,
  })
  bracket_platforms() {
    return BracketPlatformModel.find();
  }
}
