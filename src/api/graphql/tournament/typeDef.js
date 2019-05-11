import { gql } from 'apollo-server-express'

export default gql`
  type Tournament {
    id: ID!
    name: String
    type: String
    dateStart: String
    dateEnd: String
    bracket: String
    bracketImage: String
    signUpUrl: String
    challongeId: Int
    youtube: String
  }
`
