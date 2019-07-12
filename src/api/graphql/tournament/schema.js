import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapField, mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, join, map } from 'lodash'
import { Types } from 'mongoose'
import Tournament from '../../../common/tournament/model'
import { typeDefs as dateTypeDef, resolvers as dateResolvers } from '../scalars/date'

const { ObjectId } = Types

const { project, resolvers } = gqlProjection({
  Tournament: {
    proj: {
      id: '_id',
      name: 'name',
      type: 'type',
      dateTimeStart: 'dateStart',
      dateTimeEnd: 'dateEnd',
      bracket: 'bracket',
      bracketImage: 'bracketImage',
      signUpUrl: 'signUpUrl',
      challongeId: 'challongeId',
      youtube: 'youtube',
      gameId: '_gameId',
      playerIds: 'players',
      eventId: 'event'
    }
  }
})

export default makeExecutableSchema({
  typeDefs: [dateTypeDef, typeDef, query],
  resolvers: merge(resolvers, dateResolvers, {
    Query: {
      tournaments (parent, { ids, events, games, players, sort, date_start_gte: dateStartGte, date_start_lte: dateStartLte, date_end_gte: dateEndGte, date_end_lte: dateEndLte }, context, info) {
        const proj = project(info)
        const q = {}

        if (ids) {
          q._id = {
            $in: ids.map(i => ObjectId(i))
          }
        }

        if (dateStartGte || dateStartLte) {
          q.dateStart = {}
          if (dateStartGte) {
            q.date.$gte = dateStartGte.toDate()
          }
          if (dateStartLte) {
            q.date.$lte = dateStartLte.toDate()
          }
        }

        if (dateEndGte || dateEndLte) {
          q.dateEnd = {}
          if (dateEndGte) {
            q.date.$gte = dateEndGte.toDate()
          }
          if (dateEndLte) {
            q.date.$lte = dateEndLte.toDate()
          }
        }

        if (players) {
          q.players = {
            $in: players.map(p => ObjectId(p))
          }
        }

        if (games) {
          q._gameId = {
            $in: games.map(g => ObjectId(g))
          }
        }

        if (events) {
          q.event = {
            $in: events.map(e => ObjectId(e))
          }
        }

        return Tournament.find(q, proj).sort(join(map(sort, mapSort), ' '))
      },
      tournament (parent, { id }, context, info) {
        const proj = project(info)
        return Tournament.findById(id, proj)
      },
      tournamentsCount () {
        return Tournament.count()
      },
      tournamentsByField (parent, { id, field }, context, info) {
        const proj = project(info)

        const q = {
          [mapField(field)]: ObjectId(id)
        }

        return Tournament.find(q, proj)
      }
    }
  })
})
