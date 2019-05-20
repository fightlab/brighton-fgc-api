import { gql } from 'apollo-server-express'

export default gql`
  enum EventSort {
    DATE_ASC
    DATE_DESC
    NAME_ASC
    NAME_DESC
    ID
  }

  type Event {
    id: ID!
    name: String
    date: Date
    url: String
    venue: String
  }
`

export const mapSort = sort => {
  switch (sort) {
    case 'DATE_ASC':
      return 'date'
    case 'NAME_ASC':
      return 'name'
    case 'NAME_DESC':
      return '-name'
    case 'ID':
      return '_id'
    default:
      return '-date'
  }
}
