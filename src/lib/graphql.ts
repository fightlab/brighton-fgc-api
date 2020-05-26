// Apollo GraphQL Server related things
// generated the server with all schemas/resolvers etc.

import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';
import { loaders, Loaders } from '@graphql/loaders';
import { resolvers } from '@graphql/resolvers';
import { getConfig } from '@lib/config';

// our user defined Context interface to be used to type the context object
export interface Context {
  loaders: Loaders;
}

// disable emitSchemaFile in test, since this will break tests
const { isTest } = getConfig();
const emitSchemaFile = !isTest();

// helper method to generate the schema
export const createSchema = () =>
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
