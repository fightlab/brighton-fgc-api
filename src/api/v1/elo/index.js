import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Elo, { schema } from './model'
import { create } from './controller'
import { isAdmin } from '../../../services/auth'

const EloRouter = new Router()
const { player, game, elo } = schema.tree

EloRouter.post('/', isAdmin, body({ player, game, elo }), create)

export default Elo
export { EloRouter }
