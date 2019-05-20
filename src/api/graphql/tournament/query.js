import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    tournaments(search: String): [Tournament]
    tournament(id: ID!): Tournament
    tournamentsCount: Int
    tournamentsByField(id: ID!, field: TournamentField!): [Tournament]
  }
`
