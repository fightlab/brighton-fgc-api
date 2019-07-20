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
      return ['elo', 'asc']
    case 'ELO_DESC':
      return ['elo', 'desc']
    case 'MATCHES_ASC':
      return ['matches', 'asc']
    case 'MATCHES_DESC':
      return ['-matches', 'desc']
    case 'GAMEID':
      return ['game', 'asc']
    case 'PLAYERID':
      return ['player', 'asc']
    default:
      return ['_id', 'asc']
  }
}
