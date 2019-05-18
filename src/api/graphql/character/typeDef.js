import { gql } from 'apollo-server-express'

export default gql`
  enum CharacterSort {
    NAME_ASC
    NAME_DESC
    GAMEID
    ID
  }

  type Character {
    id: ID!
    name: String
    shortName: String
    gameId: ID
  }
`

export const mapSort = sort => {
  switch (sort) {
    case 'NAME_ASC':
      return 'short'
    case 'NAME_DESC':
      return '-short'
    case 'GAMEID':
      return 'game'
    default:
      return '_id'
  }
}
