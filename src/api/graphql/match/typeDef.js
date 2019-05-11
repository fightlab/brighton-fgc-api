import { gql } from 'apollo-server-express'

export default gql`
  type Score {
    p1: Int
    p2: Int
  }

  type Match {
    id: ID!
    _player1EloBefore: Int
    _player1EloAfter: Int
    _player1MatchesBefore: Int
    _player2EloBefore: Int
    _player2EloAfter: Int
    _player2MatchesBefore: Int
    round: Int!
    startDate: String
    endDate: String
    roundName: String
    youtubeTimestamp: String
    youtubeId: String
    youtubeSeconds: Int
  }
`
