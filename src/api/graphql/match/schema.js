import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge } from 'lodash'
import Match from '../../../common/match/model'

const { project, resolvers } = gqlProjection({
  Match: {
    proj: {
      id: '_id',
      player1EloBeforeMatch: '_player1EloBefore',
      player1EloAfterMatch: '_player1EloAfter',
      player1MatchesBefore: '_player1MatchesBefore',
      player2EloBeforeMatch: '_player2EloBefore',
      player2EloAfterMatch: '_player2EloAfter',
      player2MatchesBefore: '_player2MatchesBefore',
      round: 'round',
      startDate: 'startDate',
      endDate: 'endDate',
      roundName: 'roundName',
      youtubeTimestamp: 'youtubeTimestamp',
      youtubeId: 'youtubeId',
      youtubeSeconds: 'youtubeSeconds',
      tournamentId: '_tournamentId',
      player1Id: '_player1Id',
      player2Id: '_player2Id',
      winnerId: '_winnerId',
      loserId: '_loserId',
      score: 'score',
      characterIds: 'characters'
    }
  }
})

export default makeExecutableSchema({
  typeDefs: [typeDef, query],
  resolvers: merge(resolvers, {
    Query: {
      async matches (parent, { search }, context, info) {
        const proj = project(info)
        const q = {}
        if (search) {
          q.$text = {
            $search: search
          }
        }
        const matches = await Match.find(q, proj)
        return matches
      },
      async match (parent, { id }, context, info) {
        const proj = project(info)
        const match = await Match.findById(id, proj)
        return match
      }
    }
  })
})
