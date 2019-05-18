import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge } from 'lodash'
import Elo from '../../../common/elo/model'

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
      elos (parent, args, context, info) {
        const proj = project(info)
        const q = {}
        return Elo.find(q, proj)
      },
      elo (parent, { id }, context, info) {
        const proj = project(info)
        return Elo.findById(id, proj)
      }
    }
  })
})
