import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge } from 'lodash'
import Character from '../../../common/character/model'

const { project, resolvers } = gqlProjection({
  Character: {
    proj: {
      id: '_id',
      name: 'name',
      shortName: 'short',
      gameId: 'game'
    }
  }
})

export default makeExecutableSchema({
  typeDefs: [typeDef, query],
  resolvers: merge(resolvers, {
    Query: {
      async characters (parent, { search }, context, info) {
        const proj = project(info)
        const q = {}
        if (search) {
          q.$text = {
            $search: search
          }
        }
        const characters = await Character.find(q, proj)
        return characters
      },
      async character (parent, { id }, context, info) {
        const proj = project(info)
        const character = await Character.findById(id, proj)
        return character
      }
    }
  })
})
