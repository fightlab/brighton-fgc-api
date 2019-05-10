import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    players: [Player]
    player(id: ID!): Player
  }
`
