import { Resolver, Query, Authorized, Ctx } from 'type-graphql';
import { Context } from '@lib/graphql';

@Resolver()
export class AuthResolver {
  @Authorized()
  @Query(() => Boolean, {
    description:
      'Returns "true" if authenticated, "null" if not authenticated.',
    nullable: true,
  })
  authenticated(): boolean {
    return true;
  }

  @Authorized()
  @Query(() => [String], {
    description:
      'Check authentication and valid permissions available. "null" if not authenticated or no permissions',
    nullable: true,
  })
  permissions(@Ctx() ctx: Context): Array<string> {
    return ctx.user.permissions;
  }

  @Authorized('admin')
  @Query(() => Boolean, {
    description:
      'Returns "true" if authenticated as an admin user, "null" otherwise',
    nullable: true,
  })
  authenticatedAsAdmin(): boolean {
    return true;
  }
}
