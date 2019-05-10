import { gql } from 'apollo-server-express'

export default gql`
  type Player {
    id: ID!
    handle: String
  }
`
