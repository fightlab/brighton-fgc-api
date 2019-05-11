import { mergeSchemas } from 'graphql-tools'

import PlayerSchema from './player'
import GameSchema from './game'

export default mergeSchemas({
  schemas: [
    PlayerSchema,
    GameSchema
  ]
})
