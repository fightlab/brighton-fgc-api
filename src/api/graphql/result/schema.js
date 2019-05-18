import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge } from 'lodash'
import Result from '../../../common/result/model'

const { project, resolvers } = gqlProjection({
  Result: {
    proj: {
      id: '_id',
      rank: 'rank',
      eloBeforeTournament: 'eloBefore',
      eloAfterTournament: 'eloAfter',
      playerId: '_playerId',
      tournamentId: '_tournamentId',
      player: { query: '_playerId' },
      tournament: { query: '_tournamentId' }
    }
  }
})

export default makeExecutableSchema({
  typeDefs: [typeDef, query],
  resolvers: merge(resolvers, {
    Query: {
      results (parent, args, context, info) {
        const proj = project(info)
        const q = {}
        return Result.find(q, proj)
      },
      result (parent, { id }, context, info) {
        const proj = merge(project(info), {
          _tournamentId: 1,
          _playerId: 1
        })
        return Result.findById(id, proj)
      }
    }
  })
})
