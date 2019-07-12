import { gql } from 'apollo-server-express'

export default gql`
  enum ResultSort {
    ID
    ELO_AFTER_ASC
    ELO_BEFORE_ASC
    ELO_AFTER_DESC
    ELO_BEFORE_DESC
    RANK_ASC
    RANK_DESC
  }

  type Result {
    id: ID!
    rank: Int
    eloBeforeTournament: Int
    eloAfterTournament: Int
    playerId: ID
    tournamentId: ID
  }
`

export const mapSort = sort => {
  switch (sort) {
    case 'ELO_AFTER_ASC':
      return 'eloAfterTournament'
    case 'ELO_BEFORE_ASC':
      return 'eloBeforeTournament'
    case 'ELO_AFTER_DESC':
      return '-eloAfterTournament'
    case 'ELO_BEFORE_DESC':
      return '-eloBeforeTournament'
    case 'RANK_ASC':
      return 'rank'
    case 'RANK_DESC':
      return '-rank'
    default:
      return '_id'
  }
}
