import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    players(search: String): [Player]
    player(id: ID!): Player
  }
`
