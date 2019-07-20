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
      return ['eloAfterTournament', 'asc']
    case 'ELO_BEFORE_ASC':
      return ['eloBeforeTournament', 'asc']
    case 'ELO_AFTER_DESC':
      return ['eloAfterTournament', 'desc']
    case 'ELO_BEFORE_DESC':
      return ['eloBeforeTournament', 'desc']
    case 'RANK_ASC':
      return ['rank', 'asc']
    case 'RANK_DESC':
      return ['rank', 'desc']
    default:
      return ['_id', 'asc']
  }
}
