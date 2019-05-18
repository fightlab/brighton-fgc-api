import { gql } from 'apollo-server-express'

export default gql`
  type Tournament {
    id: ID!
    name: String
    type: String
    dateTimeStart: String
    dateTimeEnd: String
    bracket: String
    bracketImage: String
    signUpUrl: String
    challongeId: Int
    youtube: String
    gameId: ID
    playerIds: [ID]
    eventId: ID
  }
`
