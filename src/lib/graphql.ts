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
import { User, RequestWithUser } from '@lib/auth';

// our user defined Context interface to be used to type the context object
export interface Context {
  loaders: Loaders;
  user: User;
}

export interface CtxWithArgs<T> {
  args: T;
  ctx: Context;
}

// disable emitSchemaFile in test, since this will break tests
const { isTest } = getConfig();
const emitSchemaFile = !isTest();

// auth checker
const authChecker: AuthChecker<Context> = ({ context }) => {
  const { user } = context;

  // check if user exists, if not then not authorised
  if (!user || !user.exp) {
    return false;
  }

  return true; // or false if access is denied
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
    authChecker,
    authMode: 'null',
  });

// generate and return an instance of the apollo server
export const makeApolloServer: () => Promise<ApolloServer> = async () => {
  const schema = await createSchema();

  return new ApolloServer({
    schema,
    context: ({ req }: { req: RequestWithUser }) =>
      ({
        loaders,
        user: req.user,
      } as Context),
    playground: true,
    introspection: true,
  });
};
