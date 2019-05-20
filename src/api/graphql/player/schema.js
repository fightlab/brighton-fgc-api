import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge } from 'lodash'
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
      players (parent, { search, ids }, context, info) {
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
        return Player.find(q, proj)
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
