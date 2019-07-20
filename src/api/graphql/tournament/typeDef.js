import { gql } from 'apollo-server-express'

export default gql`
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

export const mapSort = sort => {
  switch (sort) {
    case 'DATETIME_START_ASC':
      return ['dateStart', 'asc']
    case 'DATETIME_START_DESC':
      return ['dateStart', 'desc']
    case 'DATETIME_END_ASC':
      return ['dateEnd', 'asc']
    case 'DATETIME_END_DESC':
      return ['dateEnd', 'desc']
    case 'ID':
      return ['_id', 'asc']
    default:
      return ['dateEnd', 'desc']
  }
}
