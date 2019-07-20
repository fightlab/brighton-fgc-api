import { makeExecutableSchema } from 'graphql-tools'
import typeDef, { mapSort } from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge, map, orderBy, unzip } from 'lodash'
import Event from '../../../common/event/model'
import { typeDefs as dateTypeDef, resolvers as dateResolvers } from '../scalars/date'
import { Types } from 'mongoose'

const { ObjectId } = Types

const { resolvers } = gqlProjection({
  Event: {
    proj: {
      id: '_id',
      name: 'name',
      date: 'date',
      url: 'url',
      venue: 'venue'
    }
  }
})

export default makeExecutableSchema({
  typeDefs: [dateTypeDef, typeDef, query],
  resolvers: merge(resolvers, dateResolvers, {
    Query: {
      async events (parent, { search, ids, date_gte: dateGte, date_lte: dateLte, sort = 'DATE_DESC' }, { loaders }, info) {
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

        if (dateGte || dateLte) {
          q.date = {}
          if (dateGte) {
            q.date.$gte = dateGte.toDate()
          }
          if (dateLte) {
            q.date.$lte = dateLte.toDate()
          }
        }

        const events = await loaders.EventsLoader.load(q)
        const [iteratees, orders] = unzip(map(sort, mapSort))
        return orderBy(events, iteratees, orders)
      },
      event (parent, { id }, context, info) {
        return Event.findById(id)
      },
      eventsCount () {
        return Event.count()
      }
    }
  })
})
