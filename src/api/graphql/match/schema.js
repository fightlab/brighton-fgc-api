import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, isArray } from 'lodash'
import mongoose from 'mongoose'
import Match from '../../../common/match/model'

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
  typeDefs: [typeDef, query],
  resolvers: merge(resolvers, {
    Query: {
      matches (parent, { search }, context, info) {
        const proj = project(info)
        const q = {}
        if (search) {
          q.$text = {
            $search: search
          }
        }
        return Match.find(q, proj)
      },
      match (parent, { id }, context, info) {
        const proj = project(info)
        return Match.findById(id, proj)
      },
      matchesByCharacters (parent, { ids }, context, info) {
        const proj = project(info)
        if (isArray(ids)) {
          ids = ids.map(id => mongoose.Types.ObjectId(id))
        } else {
          ids = [mongoose.Types.ObjectId(ids)]
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
