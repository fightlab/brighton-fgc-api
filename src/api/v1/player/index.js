import { Router } from 'express'
import { middleware as body } from 'bodymen'

import { isAdmin, isAuthenticatedWithProfile } from '../../../services/auth'
import { create, index, indexPlayers, show, update, destroy, stats, me, meUpdate, headToHead, headToHeadOpponents, elo, gameResults } from './controller'
import Player, { schema } from './model'

const PlayerRouter = new Router()
const { name, handle, challongeUsername, challongeName, imageUrl, team, isStaff, profile, emailHash } = schema.tree

PlayerRouter.post('/', isAdmin, body({ name, handle, challongeUsername, challongeName, imageUrl, team, isStaff, profile, emailHash }), create)

PlayerRouter.get('/', index)

PlayerRouter.get('/me', isAuthenticatedWithProfile, me)

PlayerRouter.put('/me', isAuthenticatedWithProfile, body({ handle, profile }), meUpdate)

PlayerRouter.get('/index', indexPlayers)

PlayerRouter.get('/:id', show)

PlayerRouter.get('/:id/statistics', stats)

PlayerRouter.get('/:id/opponents', headToHeadOpponents)

PlayerRouter.get('/:id/elo', elo)

PlayerRouter.get('/:id/results/:gameId', gameResults)

PlayerRouter.get('/:player1/statistics/:player2', headToHead)

PlayerRouter.put('/:id', isAdmin, body({ name, handle, challongeUsername, challongeName, imageUrl, team, isStaff, profile, emailHash }), update)

PlayerRouter.delete('/:id', isAdmin, destroy)

export default Player
export { PlayerRouter }
