// Apollo GraphQL Server related things
// generated the server with all schemas/resolvers etc.

import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { BracketPlatformResolver } from '@graphql/resolvers/bracket_platform';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { loaders, Loaders } from '@graphql/loaders';
import { NODE_ENV } from '@lib/config';

// our user defined Context interface to be used to type the context object
export interface Context {
  loaders: Loaders;
}

// helper method to generate the schema
export const createSchema = () =>
  buildSchema({
    // add resolvers here
    resolvers: [BracketPlatformResolver],
    // can't use getConfig to check for node env as it breaks test
    emitSchemaFile: process.env.NODE_ENV !== NODE_ENV.TEST,
    // custom scalars here
    scalarsMap: [
      {
        type: ObjectId,
        scalar: ObjectIdScalar,
      },
    ],
    // we prefer dates in iso date format
    dateScalarMode: 'isoDate',
  });

// generate and return an instance of the apollo server
export const makeApolloServer: () => Promise<ApolloServer> = async () => {
  const schema = await createSchema();

  return new ApolloServer({
    schema,
    context: {
      loaders,
    } as Context,
    playground: true,
    introspection: true,
  });
};
