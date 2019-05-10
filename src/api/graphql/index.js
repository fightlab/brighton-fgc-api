import { mergeSchemas } from 'graphql-tools'

import PlayerSchema from './player'

export default mergeSchemas({
  schemas: [
    PlayerSchema
  ]
})
