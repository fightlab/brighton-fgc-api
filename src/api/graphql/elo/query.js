import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    elos(search: String): [Elo]
    elo(id: ID!): Elo
  }
`
