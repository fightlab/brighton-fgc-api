import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Game, { schema } from '../../../common/game/model'
import { create, index, show, update, destroy, tournaments, elo, recalculateElo } from './controller'
import { isAdmin } from '../../../services/auth'

const { name, short, imageUrl, bgUrl, meta } = schema.tree

const GameRouter = new Router()

GameRouter.get('/', index)

GameRouter.get('/:id', show)

GameRouter.get('/:id/tournaments', tournaments)

GameRouter.get('/:id/elo', elo)

GameRouter.put('/:id/elo', isAdmin, recalculateElo)

GameRouter.post('/', isAdmin, body({ name, short, imageUrl, bgUrl, meta }), create)

GameRouter.put('/:id', isAdmin, body({ name, short, imageUrl, bgUrl, meta }), update)

GameRouter.delete('/:id', isAdmin, destroy)

export default Game
export { GameRouter }
