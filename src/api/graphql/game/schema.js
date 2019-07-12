import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, join, map } from 'lodash'
import Game from '../../../common/game/model'
import { Types } from 'mongoose'

const { ObjectId } = Types

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
      games (parent, { search, ids, sort }, context, info) {
        const proj = project(info)
        const q = {}

        if (ids) {
          q._id = {
            $in: ids.map(i => ObjectId(i))
          }
        }

        if (search) {
          q.$text = {
            $search: search
          }
        }

        return Game.find(q, proj).sort(join(map(sort, mapSort), ' '))
      },
      game (parent, { id }, context, info) {
        const proj = project(info)
        return Game.findById(id, proj)
      },
      gamesCount () {
        return Game.count()
      }
    }
  })
})
