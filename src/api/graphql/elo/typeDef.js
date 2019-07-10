import { gql } from 'apollo-server-express'

export default gql`
  enum EloSort {
    ELO_ASC
    ELO_DESC
    MATCHES_ASC
    MATCHES_DESC
    PLAYERID
    GAMEID
    ID
  }

  enum EloField {
    GAMEID
    PLAYERID
  }

  type Elo {
    id: ID!
    elo: Int
    matches: Int
    playerId: ID
    gameId: ID
  }
`

export const mapSort = sort => {
  switch (sort) {
    case 'ELO_ASC':
      return 'elo'
    case 'ELO_DESC':
      return '-elo'
    case 'MATCHES_ASC':
      return 'matches'
    case 'MATCHES_DESC':
      return '-matches'
    case 'GAMEID':
      return 'game'
    case 'PLAYERID':
      return 'player'
    default:
      return '_id'
  }
}

export const mapField = field => {
  switch (field) {
    case 'GAMEID':
      return 'game'
    case 'PLAYERID':
      return 'player'
    default:
      return ''
  }
}
