import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, map, orderBy, unzip } from 'lodash'
import mongoose from 'mongoose'
import Elo from '../../../common/elo/model'

const { ObjectId } = mongoose.Types

const { resolvers } = gqlProjection({
  Elo: {
    proj: {
      id: '_id',
      elo: 'elo',
      matches: 'matches',
      gameId: 'game',
      playerId: 'player'
    }
  }
})

export default makeExecutableSchema({
  typeDefs: [typeDef, query],
  resolvers: merge(resolvers, {
    Query: {
      async elos (parent, { ids, players, games, elo_gte: eloGte, elo_lte: eloLte, sort = '_id' }, { loaders }, info) {
        const q = {}

        if (ids) {
          q._id = {
            $in: ids.map(i => ObjectId(i))
          }
        }

        if (players) {
          q.player = {
            $in: players.map(p => ObjectId(p))
          }
        }

        if (games) {
          q.game = {
            $in: games.map(g => ObjectId(g))
          }
        }

        if (eloGte || eloLte) {
          q.elo = {}
          if (eloGte) {
            q.elo.$gte = eloGte
          }

          if (eloLte) {
            q.elo.$lte = eloLte
          }
        }

        const elos = await loaders.ElosLoader.load(q)
        const [iteratees, orders] = unzip(map(sort, mapSort))
        return orderBy(elos, iteratees, orders)
      },
      elo (parent, { id }, { loaders }, info) {
        return loaders.EloLoader.load(ObjectId(id))
      },
      elosCount () {
        return Elo.estimatedDocumentCount()
      }
    }
  })
})
