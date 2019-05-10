import { makeExecutableSchema } from 'graphql-tools'
import typeDef from './typeDef'
import query from './query'
import resolvers from './resolvers'

export default makeExecutableSchema({
  typeDefs: [typeDef, query],
  resolvers
})
