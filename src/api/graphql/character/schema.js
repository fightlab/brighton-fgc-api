import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge } from 'lodash'
import mongoose from 'mongoose'
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
      characters (parent, { search, ids }, context, info) {
        const proj = project(info)
        const q = {}
        if (search) {
          q.$text = {
            $search: search
          }
        }
        if (ids) {
          q._id = {
            $in: ids.map(id => mongoose.Types.ObjectId(id))
          }
        }
        return Character.find(q, proj)
      },
      character (parent, { id }, context, info) {
        const proj = project(info)
        return Character.findById(id, proj)
      }
    }
  })
})
