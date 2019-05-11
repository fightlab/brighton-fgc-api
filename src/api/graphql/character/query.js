import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    characters(search: String): [Character]
    character(id: ID!): Character
  }
`
