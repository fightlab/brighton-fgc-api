import { gql } from 'apollo-server-express'

export default gql`
  type Character {
    id: ID!
    name: String
    shortName: String
    gameId: ID
  }
`
