import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    games(search: String): [Game]
    game(id: ID!): Game
  }
`
