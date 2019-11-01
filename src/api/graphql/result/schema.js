import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, map, orderBy, unzip } from 'lodash'
import Result from '../../../common/result/model'
import mongoose from 'mongoose'

const { ObjectId } = mongoose.Types

const { resolvers } = gqlProjection({
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
      async results (parent, { sort = '_id', ids, players, tournaments, rank }, { loaders }, info) {
        const q = {}

        if (ids) {
          q._id = {
            $in: ids.map(i => ObjectId(i))
          }
        }

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

        const results = await loaders.ResultsLoader.load(q)
        const [iteratees, orders] = unzip(map(sort, mapSort))
        return orderBy(results, iteratees, orders)
      },
      result (parent, { id }, { loaders }, info) {
        return loaders.ResultLoader.load(ObjectId(id))
      },
      resultsCount () {
        return Result.estimatedDocumentCount()
      }
    }
  })
})
