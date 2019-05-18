import { gql } from 'apollo-server-express'

export default gql`
  type Event {
    id: ID!
    name: String
    date: String
    url: String
    venue: String
  }
`
