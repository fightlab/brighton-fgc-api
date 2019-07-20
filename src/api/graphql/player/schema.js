import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, map, fromPairs, orderBy, unzip } from 'lodash'
import mongoose from 'mongoose'
import Player from '../../../common/player/model'

const { resolvers } = gqlProjection({
  Player: {
    proj: {
      id: '_id',
      handle: 'handle',
      challongeUsername: 'challongeUsername',
      tournamentNames: 'challongeName',
      image: 'imageUrl',
      team: 'team',
      isStaff: 'isStaff',
      hash: 'emailHash',
      profile: 'profile'
    }
  }
})

export default makeExecutableSchema({
  typeDefs: [typeDef, query],
  resolvers: merge(resolvers, {
    Query: {
      async players (parent, { search, ids, sort = '_id', all = true }, { loaders }, info) {
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

        if (all) {
          const players = await loaders.PlayersLoader.load(q)
          const [iteratees, orders] = unzip(map(sort, mapSort))
          return orderBy(players, iteratees, orders)
        } else {
          const agg = [{
            $match: q
          }, {
            $lookup: {
              from: 'tournaments',
              localField: '_id',
              foreignField: 'players',
              as: 'tournaments'
            }
          }, {
            $project: {
              _id: '$_id',
              handle: '$handle',
              challongeUsername: '$challongeUsername',
              emailHash: '$emailHash',
              imageUrl: '$imageUrl',
              isStaff: '$isStaff',
              tournamentCount: {
                $size: '$tournaments'
              },
              profile: '$profile'
            }
          }, {
            $match: {
              tournamentCount: {
                $gte: 5
              }
            }
          }, {
            $sort: fromPairs(map(map(sort, mapSort), v => [v[0], v[1] === 'desc' ? -1 : 1]))
          }]
          return Player
            .aggregate(agg)
        }
      },
      player (parent, { id }, context, info) {
        return Player.findById(id)
      },
      playersCount () {
        return Player.count()
      }
    }
  })
})
