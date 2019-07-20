import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, map, orderBy, unzip } from 'lodash'
import Game from '../../../common/game/model'
import { Types } from 'mongoose'

const { ObjectId } = Types

const { resolvers } = gqlProjection({
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
      async games (parent, { search, ids, sort = '_id' }, { loaders }, info) {
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

        const games = await loaders.GamesLoader.load(q)
        const [iteratees, orders] = unzip(map(sort, mapSort))
        return orderBy(games, iteratees, orders)
      },
      game (parent, { id }, context, info) {
        return Game.findById(id)
      },
      gamesCount () {
        return Game.count()
      }
    }
  })
})
