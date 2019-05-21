import { gql } from 'apollo-server-express'

export default gql`
  enum MatchSort {
    ID
    DATE_ASC
    DATE_DESC
  }

  type Score {
    p1: Int
    p2: Int
  }

  type Match {
    id: ID!
    player1EloBeforeMatch: Int
    player1EloAfterMatch: Int
    player1MatchesBefore: Int
    player2EloBeforeMatch: Int
    player2EloAfterMatch: Int
    player2MatchesBefore: Int
    round: Int!
    startDate: Date
    endDate: Date
    roundName: String
    youtubeTimestamp: String
    youtubeId: String
    youtubeSeconds: Int
    tournamentId: ID!
    player1Id: ID!
    player2Id: ID!
    winnerId: ID!
    loserId: ID!
    score: [Score]
    characterIds: [ID]
  }
`

export const mapSort = sort => {
  switch (sort) {
    case 'DATE_ASC':
      return 'endDate'
    case 'DATE_DESC':
      return '-endDate'
    default:
      return '_id'
  }
}
