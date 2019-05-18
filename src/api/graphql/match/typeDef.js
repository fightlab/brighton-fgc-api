import { gql } from 'apollo-server-express'

export default gql`
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
    startDate: String
    endDate: String
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
