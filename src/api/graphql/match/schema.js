import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, isArray, join, map } from 'lodash'
import { Types } from 'mongoose'
import Match from '../../../common/match/model'
import { typeDefs as dateTypeDef, resolvers as dateResolvers } from '../scalars/date'

const { ObjectId } = Types

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
  typeDefs: [dateTypeDef, typeDef, query],
  resolvers: merge(resolvers, dateResolvers, {
    Query: {
      matches (parent, { ids, tournaments, players, winners, losers, characters, date_gte: dateGte, date_lte: dateLte, sort }, context, info) {
        const proj = project(info)
        const q = {}

        if (ids) {
          q._id = {
            $in: ids.map(i => ObjectId(i))
          }
        }

        if (tournaments) {
          q._tournamentId = {
            $in: tournaments.map(t => ObjectId(t))
          }
        }

        if (players) {
          q.$or = [{
            _player1Id: {
              $in: players.map(p => ObjectId(p))
            }
          }, {
            _player2Id: {
              $in: players.map(p => ObjectId(p))
            }
          }]
        }

        if (winners) {
          q._winnerId = {
            $in: winners.map(w => ObjectId(w))
          }
        }

        if (losers) {
          q._loserId = {
            $in: losers.map(l => ObjectId(l))
          }
        }

        if (characters) {
          q.characters = {
            $in: characters.map(c => ObjectId(c))
          }
        }

        if (dateGte || dateLte) {
          q.date = {}
          if (dateGte) {
            q.date.$gte = dateGte.toDate()
          }
          if (dateLte) {
            q.date.$lte = dateLte.toDate()
          }
        }

        return Match.find(q, proj).sort(join(map(sort, mapSort), ' '))
      },
      match (parent, { id }, context, info) {
        const proj = project(info)
        return Match.findById(id, proj)
      },
      matchesCount () {
        return Match.count()
      },
      matchesByCharacters (parent, { ids }, context, info) {
        const proj = project(info)

        if (isArray(ids)) {
          ids = ids.map(id => ObjectId(id))
        } else {
          ids = [ObjectId(ids)]
        }

        return Match.find({
          characters: {
            $in: ids
          }
        }, proj)
      }
    }
  })
})
