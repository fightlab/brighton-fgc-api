import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge } from 'lodash'
import Game from '../../../common/game/model'
import Character from '../../../common/character/model'

const { project, resolvers } = gqlProjection({
  Game: {
    proj: {
      id: '_id',
      name: 'name',
      shortName: 'short',
      image: 'imageUrl',
      backgroundImage: 'bgUrl'
    }
  }
})

export default makeExecutableSchema({
  typeDefs: [typeDef, query],
  resolvers: merge(resolvers, {
    Query: {
      games (parent, { search }, context, info) {
        const proj = project(info)
        const q = {}
        if (search) {
          q.$text = {
            $search: search
          }
        }
        return Game.find(q, proj)
      },
      game (parent, { id }, context, info) {
        const proj = project(info)
        return Game.findById(id, proj)
      }
    }
  })
})
