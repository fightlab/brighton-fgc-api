import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    characters(search: String, ids: [ID], games: [ID], sort: [CharacterSort]): [Character]
    character(id: ID!): Character
    charactersCount: Int
    charactersByField(id: ID!, field: CharacterFields, sort: [CharacterSort]): [Character]
  }
`
