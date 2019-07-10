import { gql } from 'apollo-server-express'

export default gql`
  enum PlayerSort {
    ID
    HANDLE_ASC
    HANDLE_DESC
    IS_STAFF
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
      return 'handle'
    case 'HANDLE_DESC':
      return '-handle'
    case 'IS_STAFF':
      return 'isStaff handle'
    default:
      return '_id'
  }
}
