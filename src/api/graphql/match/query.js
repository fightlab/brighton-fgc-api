import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    matches(tournamentId: ID, playerId: ID, winnerId: ID, loserId: ID, characterId: ID, date_gte: Date, date_lte: Date, sort: MatchSort): [Match]
    match(id: ID!): Match
    matchesCount: Int
    matchesByCharacters(ids: [ID]!): [Match]
  }
`
