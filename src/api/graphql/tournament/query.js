import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    tournaments(search: String): [Tournament]
    tournament(id: ID!): Tournament
    tournamentsByEvent(id: ID!): [Tournament]
  }
`
