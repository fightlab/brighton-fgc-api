// Apollo GraphQL Server related things
// generated the server with all schemas/resolvers etc.

import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema, AuthChecker } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { loaders, Loaders } from '@graphql/loaders';
import { resolvers } from '@graphql/resolvers';
import { getConfig } from '@lib/config';
import { GraphQLSchema } from 'graphql';
import { User, ResponseWithLocals } from '@lib/auth';

// enum of valid roles and permissions
export enum ROLES {
  ADMIN = 'admin',
}

// our user defined Context interface to be used to type the context object
export interface Context {
  loaders: Loaders;
  user: User;
}

// add context object to generic arguments type
export interface CtxWithArgs<T> {
  args: T;
  ctx: Context;
}

// disable emitSchemaFile in test, since this will break tests
// also get the auth0 enabled value, to check if auth is enabled
const {
  isTest,
  auth0: { enabled: authEnabled },
} = getConfig();
const emitSchemaFile = !isTest();

// auth checker
const authChecker: AuthChecker<Context> = ({ context }, roles) => {
  // authentication not enabled, so always valid
  if (!authEnabled) {
    return true;
  }

  // get the user from the context object
  const { user } = context;

  // check if user exists, if not then not authorised
  if (!user || !user.exp) {
    return false;
  }

  // check if field, query or mutation needs a specific role by looking at the roles array
  // "roles" array defines what roles can access that particular field, query or mutation in graphql
  if (roles.length) {
    // so we check each expected role against the users permissions to see if the user has permission for that role
    return roles.some((role) => user.permissions.includes(role));
  }

  // at this point the user is authenticated by default
  return true;
};

// helper method to generate the schema
export const createSchema = (): Promise<GraphQLSchema> =>
  buildSchema({
    // add resolvers here
    resolvers,
    // output the schema file
    emitSchemaFile,
    // custom scalars here
    scalarsMap: [
      {
        type: ObjectId,
        scalar: ObjectIdScalar,
      },
    ],
    // we prefer dates in iso date format
    dateScalarMode: 'isoDate',
    // we validate using mongoose/typegoose
    validate: false,
    // add our custom auth checker
    authChecker,
    // if not authorized, just return null
    authMode: 'null',
  });

// generate and return an instance of the apollo server
export const makeApolloServer: () => Promise<ApolloServer> = async () => {
  const schema = await createSchema();

  return new ApolloServer({
    schema,
    context: ({ res }: { res: ResponseWithLocals }) =>
      ({
        loaders,
        user: res.locals.user,
      } as Context),
    playground: true,
    introspection: true,
  });
};
