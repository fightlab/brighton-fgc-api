import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, map, orderBy, unzip } from 'lodash'
import { Types } from 'mongoose'
import Tournament from '../../../common/tournament/model'
import { typeDefs as dateTypeDef, resolvers as dateResolvers } from '../scalars/date'

const { ObjectId } = Types

const { resolvers } = gqlProjection({
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
      async tournaments (parent, { ids, events, games, players, sort = ['DATETIME_END_DESC'], date_start_gte: dateStartGte, date_start_lte: dateStartLte, date_end_gte: dateEndGte, date_end_lte: dateEndLte }, { loaders }, info) {
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

        const tournaments = await loaders.TournamentsLoader.load(q)
        const [iteratees, orders] = unzip(map(sort, mapSort))
        return orderBy(tournaments, iteratees, orders)
      },
      tournament (parent, { id }, context, info) {
        return Tournament.findById(id)
      },
      tournamentsCount () {
        return Tournament.count()
      }
    }
  })
})
