import { gql } from 'apollo-server-express'

export default gql`
  enum TournamentField {
    GAMEID
    PLAYERID
    EVENTID
  }

  enum TournamentSort {
    DATETIME_START_ASC
    DATETIME_START_DESC
    DATETIME_END_ASC
    DATETIME_END_DESC
    ID
  }

  type Tournament {
    id: ID!
    name: String
    type: String
    dateTimeStart: Date
    dateTimeEnd: Date
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

export const mapSort = sort => {
  switch (sort) {
    case 'DATETIME_START_ASC':
      return 'dateStart'
    case 'DATETIME_START_DESC':
      return '-dateStart'
    case 'DATETIME_END_ASC':
      return 'dateEnd'
    case 'DATETIME_END_DESC':
      return '-dateEnd'
    case 'ID':
      return '_id'
    default:
      return '-dateEnd'
  }
}
