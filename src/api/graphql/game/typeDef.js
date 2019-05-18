import { gql } from 'apollo-server-express'

export default gql`
  type Game {
    id: ID!
    name: String
    shortName: String
    image: String
    backgroundImage: String
  }
`
