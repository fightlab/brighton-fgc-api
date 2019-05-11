import { gql } from 'apollo-server-express'

export default gql`
  type Game {
    id: ID!
    name: String
    short: String
    imageUrl: String
    bgUrl: String
  }
`
