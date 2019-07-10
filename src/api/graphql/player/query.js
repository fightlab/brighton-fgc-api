import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    players(search: String, ids: [ID], sort: [PlayerSort], all: Boolean): [Player]
    player(id: ID!): Player
    playersCount: Int
  }
`
