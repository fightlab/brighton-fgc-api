import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, join, map } from 'lodash'
import Result from '../../../common/result/model'
import mongoose from 'mongoose'

const { ObjectId } = mongoose.Types

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
      results (parent, { sort, players, tournaments, rank }, context, info) {
        const proj = project(info)
        const q = {}

        if (players) {
          q._playerId = {
            $in: players.map(p => ObjectId(p))
          }
        }

        if (tournaments) {
          q._tournamentId = {
            $in: tournaments.map(t => ObjectId(t))
          }
        }

        if (rank) {
          q.rank = {
            $lte: rank
          }
        }

        return Result.find(q, proj).sort(join(map(sort, mapSort), ' '))
      },
      result (parent, { id }, context, info) {
        const proj = merge(project(info), {
          _tournamentId: 1,
          _playerId: 1
        })
        return Result.findById(id, proj)
      },
      resultsCount () {
        return Result.count()
      }
    }
  })
})
