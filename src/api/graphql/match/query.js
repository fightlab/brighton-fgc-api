import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    matches(search: String): [Match]
    match(id: ID!): Match
  }
`
