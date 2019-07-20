import { ApolloServer } from 'apollo-server-express'
import Schemas, { loaders } from '../../api/graphql'

export default () => {
  const server = new ApolloServer({
    schema: Schemas,
    context: { loaders },
    introspection: true,
    playground: true
  })

  return server
}
