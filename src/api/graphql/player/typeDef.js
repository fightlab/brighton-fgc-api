import { gql } from 'apollo-server-express'

export default gql`
  enum PlayerSort {
    ID
    HANDLE_ASC
    HANDLE_DESC
    IS_STAFF
    TOURNAMENT_COUNT_DESC
    TOURNAMENT_COUNT_ASC
  }

  type Profile {
    facebook: String
    instagram: String
    twitter: String
    web: String
    playstation: String
    xbox: String
    discord: String
    steam: String
    github: String
    twitch: String
  }

  type Player {
    id: ID!
    handle: String
    challongeUsername: String
    tournamentNames: [String]
    image: String
    team: String
    isStaff: Boolean
    hash: String
    profile: Profile
  }
`

export const mapSort = sort => {
  switch (sort) {
    case 'HANDLE_ASC':
      return ['handle', 'asc']
    case 'HANDLE_DESC':
      return ['handle', 'desc']
    case 'IS_STAFF':
      return ['isStaff', 'desc']
    case 'TOURNAMENT_COUNT_DESC':
      return ['tournamentCount', 'desc']
    case 'TOURNAMENT_COUNT_ASC':
      return ['tournamentCount', 'asc']
    default:
      return ['_id', 'asc']
  }
}
