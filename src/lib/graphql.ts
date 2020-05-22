import { ApolloServer } from 'apollo-server-express';
import { resolvers, typeDefs } from '@graphql/index';

export const server = new ApolloServer({
  resolvers,
  typeDefs,
  introspection: true,
  playground: true,
});
