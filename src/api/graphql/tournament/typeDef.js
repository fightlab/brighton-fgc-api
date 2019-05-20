import { gql } from 'apollo-server-express'

export default gql`
  enum TournamentField {
    GAMEID
    PLAYERID
    EVENTID
  }

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

export const mapField = field => {
  switch (field) {
    case 'GAMEID':
      return '_gameId'
    case 'EVENTID':
      return 'event'
    case 'PLAYERID':
      return 'players'
    default:
      return ''
  }
}
