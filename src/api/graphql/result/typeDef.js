import { gql } from 'apollo-server-express'

export default gql`
  type Result {
    id: ID!
    rank: Int
    eloBefore: Int
    eloAfter: Int
  }
`
