import config from './config'
import mongoose from './services/mongoose'
import express from './services/express'
import api from './api'
import graphql from './services/graphql'

const app = express(config.apiRoot, api)
const server = graphql()

server.applyMiddleware({ app })

mongoose.connect(config.mongo.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
mongoose.Promise = Promise

setImmediate(() => {
  app.listen(config.port, config.ip, () => {
    console.log(`Express server listening on http://${config.ip}:${config.port}, in ${config.env} mode`)
    console.log(`GraphQL server ready at http://${config.ip}:${config.port}${server.graphqlPath}`)
  })
})

export default app
