import { gql } from 'apollo-server-express'

export default gql`
  type Elo {
    id: ID!
    elo: Int
    matches: Int
  }
`
