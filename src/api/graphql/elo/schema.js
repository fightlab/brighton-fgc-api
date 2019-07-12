import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort, mapField } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, map, join } from 'lodash'
import mongoose from 'mongoose'
import Elo from '../../../common/elo/model'

const { ObjectId } = mongoose.Types

const { project, resolvers } = gqlProjection({
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
      elos (parent, { ids, players, games, elo_gte: eloGte, elo_lte: eloLte, sort }, context, info) {
        const proj = project(info)
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

        return Elo.find(q, proj).sort(join(map(sort, mapSort), ' '))
      },
      elo (parent, { id }, context, info) {
        const proj = project(info)
        return Elo.findById(id, proj)
      },
      elosCount () {
        return Elo.count()
      },
      elosByField (parent, { id, field }, context, info) {
        const proj = project(info)

        const q = {
          [mapField(field)]: ObjectId(id)
        }

        return Elo.find(q, proj)
      }
    }
  })
})
