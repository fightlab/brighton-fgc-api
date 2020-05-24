import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { BracketPlatformResolver } from '@graphql/resolvers/bracket_platform';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from '@graphql/scalars/ObjectId';

export const createSchema = () =>
  buildSchema({
    resolvers: [BracketPlatformResolver],
    // can't use getConfig to check for node env as it breaks test
    emitSchemaFile: process.env.NODE_ENV !== 'test',
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
  });

export const makeApolloServer: () => Promise<ApolloServer> = async () => {
  const schema = await createSchema();

  return new ApolloServer({
    schema,
  });
};
