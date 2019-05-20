import { GraphQLScalarType } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { Kind } from 'graphql/language'
import moment from 'moment-timezone'

const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue (value) {
    return moment(value) // value from the client
  },
  serialize (value) {
    return value.toISOString() // value sent to the client
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return moment(ast.value) // ast value is always in string format
    }
    return null
  }
})

export const typeDefs = `
  scalar Date
`

export const resolvers = {
  Date: DateType
}

export default makeExecutableSchema({
  typeDefs,
  resolvers
})
