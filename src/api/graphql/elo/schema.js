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
      async elos (parent, { search }, context, info) {
        const proj = project(info)
        const q = {}
        if (search) {
          q.$text = {
            $search: search
          }
        }
        const elos = await Elo.find(q, proj)
        return elos
      },
      async elo (parent, { id }, context, info) {
        const proj = project(info)
        const elo = await Elo.findById(id, proj)
        return elo
      }
    }
  })
})
