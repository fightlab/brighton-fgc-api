import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    elos(playerId: ID, gameId: ID, elo_gte: Int, elo_lte: Int, elo: Int, sort: [EloSort]): [Elo]
    elo(id: ID!): Elo
  }
`
