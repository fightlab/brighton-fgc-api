import { ApolloServer } from 'apollo-server-express'
import Schemas from '../../api/graphql'

export default () => {
  const server = new ApolloServer({
    schema: Schemas,
    introspection: true,
    playground: true
  })

  return server
}
