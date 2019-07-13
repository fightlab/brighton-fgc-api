import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    tournaments(ids: [ID], sort: [TournamentSort], events: [ID], games: [ID], players: [ID], date_start_gte: Date, date_start_lte: Date, date_end_gte: Date, date_end_lte: Date): [Tournament]
    tournament(id: ID!): Tournament
    tournamentsCount: Int
  }
`
