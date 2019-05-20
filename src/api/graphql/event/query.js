import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    events(search: String, date_gte: Date, date_lte: Date, sort: [EventSort]): [Event]
    event(id: ID!): Event
  }
`
