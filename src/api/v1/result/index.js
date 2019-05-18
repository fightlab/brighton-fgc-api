import { Router } from 'express'
import { middleware as body } from 'bodymen'
import Result, { schema } from '../../../common/result/model'
import { isAdmin } from '../../../services/auth'
import { create, index, show, update, destroy } from './controller'
const { _playerId, _tournamentId, rank, meta, eloBefore, eloAfter } = schema.tree

const ResultRouter = new Router()

ResultRouter.post('/', isAdmin, body({ _playerId, _tournamentId, rank, meta, eloBefore, eloAfter }), create)

ResultRouter.get('/', index)

ResultRouter.get('/:id', show)

ResultRouter.put('/:id', isAdmin, body({ _playerId, _tournamentId, rank, meta, eloBefore, eloAfter }), update)

ResultRouter.delete('/:id', isAdmin, destroy)

export default Result
export { ResultRouter }
