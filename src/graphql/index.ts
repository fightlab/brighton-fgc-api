import { gql } from 'apollo-server-express';

const games = [
  {
    name: 'Street Fighter V',
    short: 'SFV',
  },
  {
    name: 'Tekken 7',
    short: 'T7',
  },
];

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
export const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Game" type defines the queryable fields for every book in our data source.
  type Game {
    name: String
    short: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "games" query returns an array of zero or more Games (defined above).
  type Query {
    games: [Game]
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves games from the "games" array above.
export const resolvers = {
  Query: {
    games: () => games,
  },
};
