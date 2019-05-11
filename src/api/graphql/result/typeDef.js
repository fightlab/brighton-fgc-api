import { gql } from 'apollo-server-express'

export default gql`
  type Result {
    id: ID!
    rank: Int
    eloBeforeTournament: Int
    eloAfterTournament: Int
    playerId: ID
    tournamentId: ID
  }
`
