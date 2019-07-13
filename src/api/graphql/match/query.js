import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    matches(ids: [ID], tournaments: [ID], players: [ID], winners: [ID], losers: [ID], characters: [ID], date_gte: Date, date_lte: Date, sort: [MatchSort]): [Match]
    match(id: ID!): Match
    matchesCount: Int
  }
`
