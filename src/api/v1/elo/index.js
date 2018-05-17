import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Elo, { schema } from './model'
import { create } from './controller'
import { isAdmin } from '../../../services/auth'

const EloRouter = new Router()
const { player, game, elo, tournaments } = schema.tree

EloRouter.post('/', isAdmin, create)

export default Elo
export { EloRouter }
