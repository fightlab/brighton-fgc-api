import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    events(search: String): [Event]
    event(id: ID!): Event
  }
`
