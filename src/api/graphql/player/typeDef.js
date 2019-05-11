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
    challongeName: [String]
    imageUrl: String
    team: String
    isStaff: Boolean
    emailHash: String
    profile: Profile
  }
`
