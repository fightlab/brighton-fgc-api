import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    characters(search: String, ids: [ID]): [Character]
    character(id: ID!): Character
  }
`
