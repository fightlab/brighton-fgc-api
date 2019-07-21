import { gql } from 'apollo-server-express'

export default gql`
  enum GameSort {
    ID
    NAME_ASC
    NAME_DESC
  }

  type Game {
    id: ID
    name: String
    shortName: String
    image: String
    backgroundImage: String
  }
`

export const mapSort = sort => {
  switch (sort) {
    case 'NAME_ASC':
      return ['name', 'asc']
    case 'NAME_DESC':
      return ['name', 'desc']
    default:
      return ['_id', 'asc']
  }
}
