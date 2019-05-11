import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import gqlProjection from 'graphql-advanced-projection'
import { merge } from 'lodash'
import Event from '../../../common/event/model'

const { project, resolvers } = gqlProjection({
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
  typeDefs: [typeDef, query],
  resolvers: merge(resolvers, {
    Query: {
      async events (parent, { search }, context, info) {
        const proj = project(info)
        const q = {}
        if (search) {
          q.$text = {
            $search: search
          }
        }
        const events = await Event.find(q, proj)
        return events
      },
      async event (parent, { id }, context, info) {
        const proj = project(info)
        const event = await Event.findById(id, proj)
        return event
      }
    }
  })
})
