import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Match, { schema } from './model'
import { create, index, show, update, destroy } from './controller'
import { isAdmin } from '../../../services/auth'

const MatchRouter = new Router()
const { _tournamentId, _player1Id, _player2Id, _winnerId, _loserId, score, round, challongeMatchObj, startDate, endDate } = schema.tree

MatchRouter.post('/', isAdmin, body({ _tournamentId, _player1Id, _player2Id, _winnerId, _loserId, score, round, challongeMatchObj, startDate, endDate }), create)

MatchRouter.get('/', index)

MatchRouter.get('/:id', show)

MatchRouter.put('/:id', isAdmin, body({ _tournamentId, _player1Id, _player2Id, _winnerId, _loserId, score, round, challongeMatchObj, startDate, endDate }), update)

MatchRouter.delete('/:id', isAdmin, destroy)

export default Match
export { MatchRouter }
