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
      async results (parent, { search }, context, info) {
        const proj = project(info)
        const q = {}
        if (search) {
          q.$text = {
            $search: search
          }
        }
        const results = await Result.find(q, proj)
        return results
      },
      async result (parent, { id }, context, info) {
        const proj = merge(project(info), {
          _tournamentId: 1,
          _playerId: 1
        })
        const result = await Result.findById(id, proj)
        return result
      }
    }
  })
})
