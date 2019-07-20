import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, map, orderBy, unzip } from 'lodash'
import mongoose from 'mongoose'
import Character from '../../../common/character/model'

const { ObjectId } = mongoose.Types

const { resolvers } = gqlProjection({
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
      async characters (parent, { search, ids, games, sort = '_id' }, { loaders }, info) {
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

        const characters = await loaders.CharactersLoader.load(q)
        const [iteratees, orders] = unzip(map(sort, mapSort))
        return orderBy(characters, iteratees, orders)
      },
      character (parent, { id }, context, info) {
        return Character.findById(id)
      },
      charactersCount () {
        return Character.count()
      }
    }
  })
})
