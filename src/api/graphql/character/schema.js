import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort, mapField } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, join, map } from 'lodash'
import mongoose from 'mongoose'
import Character from '../../../common/character/model'

const { ObjectId } = mongoose.Types

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
      characters (parent, { search, ids, games, sort }, context, info) {
        const proj = project(info)
        const q = {}

        if (search) {
          q.$text = {
            $search: search
          }
        }

        if (ids) {
          q._id = {
            $in: ids.map(id => ObjectId(id))
          }
        }

        if (games) {
          q.game = {
            $in: games.map(g => ObjectId(g))
          }
        }

        return Character.find(q, proj).sort(join(map(sort, mapSort), ' '))
      },
      character (parent, { id }, context, info) {
        const proj = project(info)
        return Character.findById(id, proj)
      },
      charactersCount () {
        return Character.count()
      },
      charactersByField (parent, { id, field, sort }, context, info) {
        const proj = project(info)
        console.log(field)
        const q = {
          [mapField(field)]: ObjectId(id)
        }

        return Character.find(q, proj).sort(join(map(sort, mapSort), ' '))
      }
    }
  })
})
