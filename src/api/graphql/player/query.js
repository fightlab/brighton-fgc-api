import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    players(search: String, ids: [ID]): [Player]
    player(id: ID!): Player
  }
`
