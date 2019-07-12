import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    elos(ids: [ID], players: [ID], games: [ID], elo_gte: Int, elo_lte: Int, elo: Int, sort: [EloSort]): [Elo]
    elo(id: ID!): Elo,
    elosCount: Int,
    elosByField(id: ID!, field: EloField!): [Elo]
  }
`
