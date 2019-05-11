import { gql } from 'apollo-server-express'

export default gql`
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
