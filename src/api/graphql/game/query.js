import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    games(search: String, ids: [ID], sort: [GameSort]): [Game]
    game(id: ID!): Game,
    gamesCount: Int
  }
`
