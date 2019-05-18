import { env, mongo, port, ip, apiRoot } from './config'
import mongoose from './services/mongoose'
import express from './services/express'
import api from './api'
import graphql from './services/graphql'

const app = express(apiRoot, api)
const server = graphql()

server.applyMiddleware({ app })

mongoose.connect(mongo.uri)
mongoose.Promise = Promise

setImmediate(() => {
  app.listen(port, ip, () => {
    console.log(`Express server listening on http://${ip}:${port}, in ${env} mode`)
    console.log(`GraphQL server ready at http://${ip}:${port}${server.graphqlPath}`)
  })
})

export default app
