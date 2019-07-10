import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, join, map, fromPairs } from 'lodash'
import mongoose from 'mongoose'
import Player from '../../../common/player/model'

const { project, resolvers } = gqlProjection({
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
      players (parent, { search, ids, sort, all }, context, info) {
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

        if (all) {
          return Player.find(q, proj).sort(join(map(sort, mapSort), ' '))
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
            $sort: fromPairs(map(map(sort, mapSort), v => [v.replace('-', ''), v.charAt(0) === '-' ? -1 : 1]))
          }, {
            $project: proj
          }]
          return Player
            .aggregate(agg)
        }
      },
      player (parent, { id }, context, info) {
        const proj = project(info)
        return Player.findById(id, proj)
      },
      playersCount () {
        return Player.count()
      }
    }
  })
})
