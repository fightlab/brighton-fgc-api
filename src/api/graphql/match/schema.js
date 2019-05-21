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
      matches (parent, { tournamentId, playerId, winnerId, loserId, characterId, date_gte: dateGte, date_lte: dateLte, sort }, context, info) {
        const proj = project(info)
        const q = {}

        if (tournamentId) {
          q._tournamentId = ObjectId(tournamentId)
        }

        if (playerId) {
          q.$or = [{
            _player1Id: ObjectId(playerId)
          }, {
            _player2Id: ObjectId(playerId)
          }]
        }

        if (winnerId) {
          q.winnerId = ObjectId(winnerId)
        }

        if (loserId) {
          q.loserId = ObjectId(loserId)
        }

        if (characterId) {
          q.characters = ObjectId(characterId)
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
